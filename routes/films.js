const fs = require('node:fs/promises');
const express = require('express')
const router = express.Router(); 
const Film = require('../models/Film')
const upload = require('../middleware/multer/upload') 
const multer = require('multer')

// Get
router.get('/', async (req, res) => {
    try {
        const films = await Film.find()
        res.json(films)
    } catch (error) {
        res.json({message: error})
    }
})

// Get By Id
router.get('/:filmId', async (req, res) => {
    try {
        const specificFilm = await Film.findById(req.params.filmId)
        res.json(specificFilm)
    } catch(error) {
        res.json({ message: error })
    }
})

// Insert
router.post('/', upload.fields([{ name: 'poster', maxCount: 1 }]),
    async (req, res) => { 
        if (Object.keys(req.files).length === 0) {
            res.json({message: "File poster diperlukan"});
            return false;
        } 
        
        const film = new Film({
            poster: req.files.poster[0].filename,
            title: req.body.title,
            synopsis: req.body.synopsis,
            episode: req.body.status
        }) 

        try {
            const savedFilm = await film.save()
            res.json(savedFilm)
        } catch(error) {
            res.json({ message: error })
        }  
    }
)

// Update
router.put('/:filmId', upload.fields([{ name: 'poster', maxCount: 1 }]),
    async (req, res) => { 

        var data = {
            title: req.body.title,
            synopsis: req.body.synopsis,
            episode: req.body.status
        } 

        if(Object.keys(req.files).length > 0) {
            data.poster = req.files.poster[0].filename
        }

        try {
            const updatedFilm = await Film.updateOne(
                {_id: req.params.filmId}, 
                {$set: data}
            )
            res.json(updatedFilm)
        } catch (error) {
            res.json({message: error})
        }
    }
)

// Delete
router.delete('/:filmId', async (req, res) => { 
    
    try { 
        var film = await Film.findById(req.params.filmId) 
        if(film.poster) {
            await fs.unlink("images/poster/"+film.poster)
        }
        
        const filmRemoved = await film.remove()
        res.json({message: filmRemoved})
    } catch (error) {
        res.json({message: error.message})
    }
})

module.exports = router
