const Episode = require('../models/Episode')
const Film = require('../models/Film')
const fs = require('node:fs/promises')
const express = require('express')
const router = express.Router()
const path = require('path')
const verifyToken = require('../middleware/verifyToken')

router.get('/:id', async (req, res) => {
    try {
        var episode = await Episode.findOne({
            _id: req.params.id
        })
        const film = await Film.findOne({
            _id: episode.id_film
        })
        res.send({
            episode,
            film: film
        })
    } catch (error) {
        res.send({
            message: error
        })
    }
})

router.get('/cariNo/:id_film/:no', async (req, res) => {
    try {
        var episode = await Episode.findOne({
            id_film: req.params.id_film,
            no: req.params.no
        })

        if (!episode) {
            res.send({
                episode: [],
                message: 'Episode tidak tersedia',
                error: true
            })
            return false
        }

        const film = await Film.findOne({
            _id: episode.id_film
        })
        res.send({
            episode,
            film: film
        })
    } catch (error) {
        res.send({
            message: error
        })
    }
})

router.get('/', async (req, res) => {
    const films = await Episode.aggregate().lookup({
        from: 'films',
        localField: 'id_film',
        foreignField: '_id',
        as: 'film'
    }).sort({
        date: -1
    }).limit(56)
    res.send(films)
})

router.post('/:filmId', verifyToken, async (req, res) => {
    try {
        var dataFilm = await Episode.find({
            id_film: req.params.filmId
        })

        var noEps = req.body.no ? req.body.no : dataFilm.length + 1

        var newEps = {
            id_film: req.params.filmId,
            no: noEps,
            video: req.body.video,
            date: req.body.date
        }

        req.body.bvideo ? newEps.bvideo = req.body.bvideo : ''

        const eps = new Episode(newEps)

        const savedEpisode = await eps.save()
        const updated = await Film.updateOne({
            _id: req.params.filmId
        }, {
            updated_at: new Date().getTime()
        })
        res.send(savedEpisode)
    } catch (error) {
        res.send({
            message: error
        })
    }
})

router.put('/:id', verifyToken, async (req, res) => {
    try {
        var data = {}
        req.body.no ? data.no = req.body.no : ''
        req.body.video ? data.video = req.body.video : ''
        req.body.bvideo ? data.bvideo = req.body.bvideo : ''
        req.body.date ? data.date = req.body.date : ''

        const updated = await Episode.updateOne({
            _id: req.params.id
        }, data)
        res.send(updated)
    } catch (error) {
        res.send({
            message: error
        })
    }
})

router.delete('/:episodeId', verifyToken, async (req, res) => {
    try {
        var episode = await Episode.findById(req.params.episodeId)
        const removedEpisode = await episode.remove()
        res.send(removedEpisode)
    } catch (error) {
        res.send({
            message: error
        })
    }
})

router.delete('/delete-episodes/:idFilm', verifyToken, async (req, res) => {
    try {
        const idFilm = req.params.idFilm;
        const result = await Episode.deleteMany({
            id_film: idFilm
        });
        res.send(`Berhasil menghapus ${result.deletedCount} episode.`);
    } catch (error) {
        res.send({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    }
});

router.get('/getVideo/:episodeId', async (req, res) => {
    try {
        var data = await Episode.findById(req.params.episodeId)
        data.video = path.join(__dirname, '..', 'videos', data.video)
        res.sendFile(data.video)
    } catch (error) {
        res.send({
            message: error
        })
    }
})

module.exports = router