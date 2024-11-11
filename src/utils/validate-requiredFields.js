const validateRequiredFields = (fields, reqBody) => {
    fields.forEach(field => {
      if (!reqBody[field]) {
        throw new CustomError.BadRequestError(`Missing required field: ${field}`);
      }
    });
  };


  module.exports=validateRequiredFields;