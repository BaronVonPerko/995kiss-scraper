var fs = require('fs');
var request = require('request');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dbConnected = false;

mongoose.connect('mongodb://127.0.0.1:27017/kiss995scraper', function(err, db) {
    if(!err) {
        console.log("Database connection successful.");
        dbConnected = true;
    }
});

var Song = mongoose.model('Song', new Schema( {
    song: String,
    artist: String,
    timestamp: String
}));


var previousData = {
    song: null,
    timestamp: new Date('2001-01-01')
};

function scrape() {
    var url = 'http://api.lsp.kissrocks.com/api/v1/station/now-playing/';

    request({
        url: url,
        json: true,
    }, function(error, response, body) {
        if(!error && response.statusCode === 200) {
            var data = body.results[0];

            if(!data.is_song) { return; }
            
            var artist = data.artist;
            var song = data.title;
            var timestamp = new Date(data.timestamp_iso);

            if(song !== previousData.song && timestamp > previousData.timestamp) {
                // console.log(body.results);
                console.log(timestamp + ' | ' + artist + ' | ' + song);

                var song = new Song({
                    song: song,
                    artist: artist,
                    timestamp: timestamp
                });
                song.save();

                previousData = {
                    song: song,
                    timestamp: timestamp
                };
            }
        }
    });
}



setInterval(function() {
    if(dbConnected) {
        scrape();
    }
}, 10000);