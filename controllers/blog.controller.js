const { Op } = require("sequelize");
const { Blog, Topic, BlogTopic } = require("../models");

exports.getTopBlogs = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1; // default page is 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 9;
  const offset = (page - 1) * limit;
  try {
    const data = await Blog.findAll({
      limit: limit,
      offset: offset,
      include: [
        {
          model: Topic,
          as: "topics",
          through: {
            model: BlogTopic,
            attributes: ["order"],
          },
          order: [[{ model: BlogTopic, as: "blog_topics" }, "order", "ASC"]],
        },
      ],
      order: [["id", "DESC"]],
    });

    const count = await Blog.count();
    const totalPages = Math.ceil(count / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return res.status(200).json({
      data: data,
      pagination: {
        currentPage: page,
        nextPage: nextPage,
        prevPage: prevPage,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Blog.findByPk(id, {
      include: [
        {
          model: Topic,
          as: "topics",
          through: {
            model: BlogTopic,
            attributes: ["order"],
          },
          order: [[{ model: BlogTopic, as: "blog_topics" }, "order", "ASC"]],
        },
      ],
    });
    if (!data) return res.status(404).send({ err: "Blog not found" });
    await data.update({
      views: data.views + 1,
    });
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.getSimilarBlogs = async (req, res) => {
  const { id } = req.params;
  try {
    const blogExists = await Blog.findByPk(id, {
      include: [{ model: Topic }],
    });
    if (!blogExists) return res.status(404).send({ err: "Blog not found" });

    const categoryExists = await Topic.findByPk(blogExists.topics[0].id);
    if (!categoryExists)
      return res.status(404).send({ err: "Category not found" });

    const data = await Blog.findAll({
      include: [
        {
          model: Topic,
          as: "topics",
          where: {
            id: categoryExists.id,
          },
          through: {
            model: BlogTopic,
            attributes: ["order"],
          },
          order: [[{ model: BlogTopic, as: "blog_topics" }, "order", "ASC"]],
        },
      ],
      where: {
        id: {
          [Op.ne]: id,
        },
      },
      order: [["id", "DESC"]],
      limit: 9,
    });
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.getBlogByCategoryId = async (req, res) => {
  const { id } = req.params;
  const page = req.query.page ? parseInt(req.query.page) : 1; // default page is 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 9;
  const offset = (page - 1) * limit;
  try {
    const categoryExists = await Topic.findByPk(id);
    if (!categoryExists)
      return res.status(404).send({ err: "Category not found" });
    const data = await Blog.findAll({
      where: {
        id: {
          [Op.ne]: id,
        },
      },
      limit: limit,
      offset: offset,
      include: [
        {
          model: Topic,
          as: "topics",
          where: {
            id: categoryExists.id,
          },
          through: {
            model: BlogTopic,
            attributes: ["order"],
          },
          order: [[{ model: BlogTopic, as: "blog_topics" }, "order", "ASC"]],
        },
      ],
      order: [["id", "DESC"]],
    });

    const count = await Blog.count({
      where: {
        id: {
          [Op.ne]: id,
        },
      },
      include: [
        {
          model: Topic,
          as: "topics",
          where: {
            id: categoryExists.id,
          },
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return res.status(200).json({
      data: data,
      pagination: {
        currentPage: page,
        nextPage: nextPage,
        prevPage: prevPage,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.getBlogBySearchTerm = async (req, res) => {
  const { term } = req.params;
  try {
    const data = await Blog.findAll({
      where: {
        [Op.or]: [{ title: { [Op.like]: "%" + term + "%" } }],
      },
      include: [
        {
          model: Topic,
          as: "topics",
          through: {
            model: BlogTopic,
            attributes: ["order"],
          },
          order: [[{ model: BlogTopic, as: "blog_topics" }, "order", "ASC"]],
        },
      ],
      order: [["id", "DESC"]],
    });
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};
