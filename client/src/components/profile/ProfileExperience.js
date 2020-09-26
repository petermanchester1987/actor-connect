import React from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";

const ProfileExperience = ({
  experience: {
    title,
    role,
    company,
    director,
    location,
    current,
    to,
    from,
    description,
  },
}) => {
  return (
    <div>
      <h3 className="text-dark">{title}</h3>
      <p>
        <Moment format="DD/MM/YYYY">{from}</Moment> -{" "}
        {!to ? "Now" : <Moment format="DD/MM/YYYY">{to}</Moment>}
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
        <strong>Description: </strong> {description}
      </p>
    </div>
  );
};

ProfileExperience.propTypes = {
  experience: PropTypes.object.isRequired,
};

export default ProfileExperience;
