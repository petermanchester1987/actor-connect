import React from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import moment from "moment";

const ProfileExperience = ({
  experience: {
    title,
    role,
    company,
    director,
    location,
    to,
    from,
    description,
  },
}) => {
  return (
    <div>
      <h3 className="text-dark">{title}</h3>
      <p>
        <Moment format="DD/MM/YYYY">{moment.utc(from)}</Moment> -{" "}
        {!to ? "Now" : <Moment format="DD/MM/YYYY">{moment.utc(to)}</Moment>}
      </p>
      <p>
        <strong>Role: </strong> {role}
      </p>
      <p>
        <strong>Company: </strong> {company}
      </p>
      <p>
        <strong>Director: </strong> {director}
      </p>
      <p>
        <strong>Location: </strong> {location}
      </p>
      <p>
        <strong>Description: </strong> {description}
      </p>
    </div>
  );
};

ProfileExperience.propTypes = {
  experience: PropTypes.object.isRequired,
};

export default ProfileExperience;
