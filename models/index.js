const Blog = require("./Blog.model");
const Topic = require("./Topic.model");
const User = require("./User.model");
const BlogTopic = require("./blog_topic");

// relationships

// define the many-to-many association between Blog and Topic
Blog.belongsToMany(Topic, {
  through: BlogTopic,
});

module.exports = {
  Blog,
  Topic,
  User,
  BlogTopic,
};
