import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Moment from "react-moment";
import { deleteEducation } from "../../actions/profile";

const Education = ({ education, deleteEducation }) => {
  const educations = education.map((edu) => (
    <tr key={edu._id}>
      <td>{edu.school}</td>
      <td className="hide-sm">{edu.degree}</td>
      <td className="hide-sm">{edu.fieldofstudy}</td>
      <td className="hide-sm">
        <Moment format="DD/MM/YYYY">{edu.from}</Moment> -{" "}
        {edu.to === null ? (
          " Now"
        ) : (
          <Moment format="DD/MM/YYYY">{edu.to}</Moment>
        )}
      </td>

      <td>
        <button
          onClick={() => deleteEducation(edu._id)}
          className="btn btn-danger"
        >
          Delete
        </button>
      </td>
    </tr>
  ));
  return (
    <Fragment>
      <h2 className="my-2">Education / Training</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Drama / Training School</th>
            <th className="hide-sm">Qualification</th>
            <th className="hide-sm">Field</th>
            <th className="hide-sm">Dates</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{educations}</tbody>
      </table>
    </Fragment>
  );
};

Education.propTypes = {
  education: PropTypes.array.isRequired,
  deleteEducation: PropTypes.func.isRequired,
};

export default connect(null, { deleteEducation })(Education);
