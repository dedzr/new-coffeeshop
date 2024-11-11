const validateImage = (image) => {
    const maxSize = 1024 * 1024; // 1MB

    if (!image.mimetype.startsWith('image')) {
        throw new CustomAPIError.BadRequestError("You must upload an image");
    }
    if (image.size > maxSize) {
        throw new CustomAPIError.BadRequestError("Max size of image must be 1MB");
    }
};

module.exports=validateImage;