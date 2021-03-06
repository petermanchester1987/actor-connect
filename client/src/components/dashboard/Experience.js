import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Moment from "react-moment";
import moment from "moment";
import { deleteExperience } from "../../actions/profile";

const Experience = ({ experience, deleteExperience }) => {
  const experiences = experience.map((exp) => (
    <tr key={exp._id}>
      <td>{exp.title}</td>
      <td className="hide-sm">{exp.role}</td>
      <td className="hide-sm">{exp.company}</td>
      <td className="hide-sm">
        <Moment format="DD/MM/YYYY">{moment.utc(exp.from)}</Moment> -{" "}
        {exp.to === null ? (
          " Now"
        ) : (
          <Moment format="DD/MM/YYYY">{moment.utc(exp.to)}</Moment>
        )}
      </td>
      <td>
        <button
          onClick={() => deleteExperience(exp._id)}
          className="btn btn-danger"
        >
          Delete
        </button>
      </td>
    </tr>
  ));
  return (
    <Fragment>
      <h2 className="my-2">Experience Credentials</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Production</th>
            <th className="hide-sm">Role</th>
            <th className="hide-sm">Company</th>
            <th className="hide-sm">Dates</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{experiences}</tbody>
      </table>
    </Fragment>
  );
};

Experience.propTypes = {
  experience: PropTypes.array.isRequired,
  deleteExperience: PropTypes.func.isRequired,
};

export default connect(null, { deleteExperience })(Experience);
