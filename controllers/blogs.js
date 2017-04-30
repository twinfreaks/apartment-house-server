var models = require('../models'),
    moment = require('moment');

module.exports = function (router) {
    'use strict';

    router.route('/:id')
        .get(function (req, res) {
            if (typeof req.query.type !== 'undefined' && req.query.type === 'blogNear') {
                var blogTop,
                    blogPrevTop,
                    blogNextTop;
                    models.wl.collections.blog
                    .findOne({
                        id: req.params.id
                    }).populate('event')
                          .then(function (blog) {
                    blogTop = blog;
                    return models.wl.collections.blog.findOne({
                        select: ['id', 'title'],
                        updatedDate: {'<': moment(blogTop.updatedDate).format()},
                        isDeleted: false,
                        sort: 'updatedDate DESC'
                    });
                }).then(function (blogPrev) {
                    blogPrevTop = blogPrev;
                    return models.wl.collections.blog.findOne({
                        select: ['id', 'title'],
                        updatedDate: {'>': moment(blogTop.updatedDate).format()},
                        isDeleted: false,
                        sort: 'updatedDate ASC'
                    });
                }).then(function (blogNext) {
                    blogNextTop = blogNext;
                    return res.json({
                        data: {
                            blog: blogTop,
                            blogPrev: blogPrevTop,
                            blogNext: blogNextTop
                        },
                        code: 200
                    });
                }).catch(function (err) {
                    return res.json({data: err.toString(), code: 500})
                });
            }
            else {
                models.wl.collections.blog
                    .findOne({
                        id: req.params.id
                    })
                    .then(function (blog) {
                        res.json({data: blog, code: 200});
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500});
                    });
            }
        })

        .delete(function (req, res, next) {
            models.wl.collections.blog
                .update(
                    {id: req.params.id},
                    {isDeleted: true})
                .then(function () {
                    res.json({data: "Deleted", code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        })

        .put(function (req, res, next) {
            var request = req.body;
            request.updatedDate = new Date();
            models.wl.collections.blog
                .update({id: req.params.id}, request)
                .then(function (blog) {
                    res.json({data: blog, code: 200});
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500});
                });
        });

    router.route('/')
        .get(function (req, res) {
            if (typeof req.query.page !== 'undefined' && req.query.page > 0) {
                var pageNumber = req.query.page;
                var findBlogs = {
                        isDeleted: {'!': 'true'},
                        isProtocol: {'!': 'true'},
                        sort: {updatedDate: -1, id: -1}
                    },
                    blogsPerPage = 10,
                    pageCount = null;
                models.wl.collections.blog
                    .count(findBlogs)
                    .then(function (blogs) {
                        pageCount = Math.ceil(blogs / blogsPerPage);
                        return pageCount;
                    })
                    .then(function () {
                        return models.wl.collections.blog.find(findBlogs)
                            .paginate({
                                page: pageNumber, limit: blogsPerPage
                            });
                    })
                    .then(function (blogsPag) {
                        res.json({
                            data: {
                                totalPage: pageCount,
                                blogs: blogsPag
                            },
                            code: 200
                        })
                    })
                    .catch(function (err) {
                        res.json({data: err.toString(), code: 500})
                    });
            }
        })

        .post(function (req, res) {
            var request = req.body;
            request.updatedDate = new Date();
            models.wl.collections.blog
                .create(request)
                .then(function (blog) {
                    res.json({data: blog, code: 200})
                })
                .catch(function (err) {
                    res.json({data: err.toString(), code: 500})
                });
        })
};