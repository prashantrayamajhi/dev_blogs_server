const { Blog, Topic, BlogTopic } = require("../../models");
const { handleText } = require("../../helper/text");
const { Op } = require("sequelize");

exports.getAllBlogs = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1; // default page is 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 9;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const data = await News.findAll({
      where: {
        [Op.or]: [{ title: { [Op.like]: "%" + search + "%" } }],
      },

      include: [
        {
          model: Topic,
          as: "topics",
          through: {
            model: BlogTopic,
            attributes: ["order"],
          },
          order: [[{ model: NewsTopic, as: "blog_topics" }, "order", "ASC"]],
        },
      ],
      order: [["id", "DESC"]],
      limit: limit,
      offset: offset,
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

exports.getBlogsByTitle = async (req, res) => {
  const search = req.params.search || "";

  try {
    const searchWords = search.split(/\s+/); // split search string into individual words

    const whereClauses = searchWords.map((word) => ({
      title: { [Op.like]: "%" + word + "%" },
    }));

    const data = await Blog.findAll({
      where: { [Op.and]: whereClauses },
    });

    return res.status(200).json({ data });
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
            model: NewsTopic,
            attributes: ["order"],
            order: [["order", "ASC"]],
          },
        },
      ],
    });
    if (!data) return res.status(404).send({ err: "Blog not found" });
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.postBlog = async (req, res) => {
  let { title, previewText, blog, topic, isFeatured } = req.body;

  if (!title || title.trim().length <= 0)
    return res.status(400).send({ err: "Title cannot be empty" });
  if (!previewText || previewText.trim().length <= 0)
    return res.status(400).send({ err: "Preview Text cannot be empty" });
  if (!blog || blog.trim().length <= 0)
    return res.status(400).send({ err: "Blog cannot be empty" });
  if (!topic || topic.length <= 0)
    return res.status(400).send({ err: "Topic cannot be empty" });

  title = handleText(title);
  previewText = handleText(previewText);

  try {
    let blogData = await Blog.create({
      title,
      previewText,
      blog,
      isFeatured,
    });

    const topicsArr = Array.isArray(topic) ? topic : [topic];
    const topicOrders = topicsArr.map((t, i) => ({
      topicId: t,
      blogId: blogData.id,
      order: i,
    }));
    await BlogTopic.bulkCreate(topicOrders);

    const data = await Blog.findByPk(blogData.id, {
      include: [
        {
          model: Topic,
          as: "topics",
          attributes: ["id", "name"],
        },
      ],
    });

    return res.status(201).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.updateBlog = async (req, res) => {
  let { title, previewText, blog, topic, isFeatured } = req.body;
  const { id } = req.params;

  if (!title || title.trim().length <= 0)
    return res.status(400).send({ err: "Title cannot be empty" });
  if (!previewText || previewText.trim().length <= 0)
    return res.status(400).send({ err: "Preview Text cannot be empty" });
  if (!blog || blog.trim().length <= 0)
    return res.status(400).send({ err: "Blog cannot be empty" });
  if (!topic || topic.length <= 0)
    return res.status(400).send({ err: "Topic cannot be empty" });

  title = handleText(title);
  previewText = handleText(previewText);

  try {
    let blogData = await Blog.findByPk(id);

    if (!blogData) {
      return res.status(404).send({ err: "Blog not found" });
    }

    blogData.title = title;
    blogData.previewText = previewText;
    blogData.blog = blog;
    blogData.isFeatured = isFeatured;

    const topicsArr = Array.isArray(topic) ? topic : [topic];
    const topicOrders = topicsArr.map((t, i) => ({
      topicId: t,
      newsId: blogData.id,
      order: i,
    }));

    await BlogTopic.bulkCreate(topicOrders);

    await blogData.save();

    const data = await Blog.findByPk(blogData.id, {
      include: [
        {
          model: Topic,
          as: "topics",
          attributes: ["id", "name"],
          through: {
            attributes: [],
          },
        },
      ],
    });
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).send({ err: "Blog not found" });

    await blog.destroy();

    return res.status(200).send({ msg: "Blog deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};
