import Joi, { ObjectSchema } from 'joi';

const postSchema: ObjectSchema = Joi.object().keys({
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  image: Joi.string().optional().allow(null, ''),
  video: Joi.string().optional().allow(null, ''),
  videoVersion: Joi.string().optional().allow(null, ''),
  videoId: Joi.string().optional().allow(null, '')
});

export { postSchema };
