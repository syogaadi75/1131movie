const fs = require('node:fs/promises');
const express = require('express')
const router = express.Router();
const Film = require('../models/Film')
const upload = require('../middleware/multer/upload')
const multer = require('multer')
const mongoose = require('mongoose');
const Episode = require('../models/Episode');
const verifyToken = require('../middleware/verifyToken');

// Get
router.get('/', async (req, res) => {
    try {
        const films = await Film.aggregate([{
                $lookup: {
                    from: 'episodes',
                    localField: '_id',
                    foreignField: 'id_film',
                    as: 'episode'
                }
            },
            {
                $project: {
                    _id: '$_id',
                    tamat: '$tamat',
                    poster: '$poster',
                    title: '$title',
                    synopsis: '$synopsis',
                    type: '$type',
                    category: '$category',
                    date: '$date',
                    updated_at: '$updated_at',
                    episodeCount: {
                        $size: '$episode'
                    }
                }
            }
        ]).sort({
            date: -1
        })
        res.send(films)
    } catch (error) {
        res.send({
            message: error
        })
    }
})

// Cari judul
router.get('/search/:title', async (req, res) => {
    var string = req.params.title
    var regex = new RegExp(/{}/)
    string.replace(regex, '')
    var film = await Film.find({
        title: {
            $regex: string,
            $options: 'i'
        }
    })
    res.send(film)
})

// Cari judul
router.get('/jadwal', async (req, res) => {
    try {
        var start = new Date();
        start.setDate(start.getDate() - 7)
        start.setHours(23, 59, 59, 999)
        var end = new Date();
        end.setHours(23, 59, 59, 999)

        const film = await Film.find({
            updated_at: {
                $gte: start,
                $lt: end
            },
            tamat: {
                $ne: true
            }
        })
        res.send({
            film
        })
    } catch (error) {
        res.send({
            message: error
        })
    }
})

// Get By Id
router.get('/:filmId', async (req, res) => {
    try {
        var film = await Film.findById(req.params.filmId)
        var data = await Episode.find({
            id_film: req.params.filmId
        }).sort({
            no: 'desc'
        })
        res.send({
            film: film,
            episodes: data
        })
    } catch (error) {
        res.send({
            message: error
        })
    }
})

// Insert
router.post('/', verifyToken, async (req, res) => {
    const film = new Film({
        title: req.body.title,
        synopsis: req.body.synopsis,
        poster: req.body.poster,
        type: req.body.type,
        category: req.body.category,
        tamat: req.body.tamat,
        date: req.body.date,
    })

    try {
        const savedFilm = await film.save()
        res.send(savedFilm)
    } catch (error) {
        res.send({
            message: error
        })
    }
})

// Update
router.put('/:filmId', verifyToken, async (req, res) => {
    var data = {
        title: req.body.title,
        synopsis: req.body.synopsis,
        episode: req.body.status,
        poster: req.body.poster,
        type: req.body.type,
        category: req.body.category,
        tamat: req.body.tamat,
        date: req.body.date,
    }

    try {
        const updatedFilm = await Film.updateOne({
            _id: req.params.filmId
        }, {
            $set: data
        })
        res.send(updatedFilm)
    } catch (error) {
        res.send({
            message: error
        })
    }
})

// Delete
router.delete('/:filmId', verifyToken, async (req, res) => {

    try {
        var film = await Film.findById(req.params.filmId)

        const filmRemoved = await film.remove()
        res.send({
            message: filmRemoved
        })
    } catch (error) {
        res.send({
            message: error.message
        })
    }
})

module.exports = router