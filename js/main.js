/**
 * Created by Philippe Simpson on 06-09-2015.
 */

// Model class for each card item
var CardModel = Backbone.Model.extend({
    defaults: {
        id: null,
        name: null,
        occupation: null
    }
});

// Collection class for the card item list
var CardCollection = Backbone.Collection.extend({
    model: CardModel
});

// View class for displaying each card item
var CardItemView = Backbone.View.extend({
    className: 'card',
    template: _.template($('#review-card-template').html()),

    initialize: function() {
        //this.listenTo(this.model, 'destroy', this.remove)
        var profilesrc = this.model.get('firstName') + ( this.model.get('lastName').length ? "-" + this.model.get('lastName') : "" ) + ".png";
        this.model.set('profileImg', profilesrc);

        var ratingsrc = this.model.get('starRating') + "-" + ( parseInt(this.model.get('starRating')) === 1 ? "star" : "stars" ) + "-260x48.png";
        this.model.set('ratingImg', ratingsrc);
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },

    events: {
        //'click .remove': 'onRemove'
    }
});

// View class for displaying Trustscore
var SummeryView = Backbone.View.extend({
    className: 'summery',
    template: _.template($('#summery-template').html()),

    initialize: function() {

    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },

    events: {
        //'click .remove': 'onRemove'
    }
});

var count = 0;
var cardsCollection;

function loadJSON(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function startWidget(data){
    cardsCollection = new CardCollection(data);

    var summeryView = new SummeryView({
        model: new Backbone.Model(),
        collection: cardsCollection
    });
    var cont = $('.summery');
    cont.empty();
    cont.append(summeryView.render().$el);

    showCard(cardsCollection.at(0));

    //showCard(cardsCollection.at(count));
    //var timer = setInterval(nextCard, 2000);
}

function nextCard(){
    count = count < cardsCollection.length-1 ? count + 1 : 0; // increment count
    showCard(cardsCollection.at(count));
}

function showCard(model){
    var cardView = new CardItemView({model: model});
    var cont = $('.review');
    cont.empty();
    cont.append(cardView.render().$el);
}

// Load data and start widget:
loadJSON('reviews.json', function(response) {
    var jsonData = JSON.parse(response);
    startWidget(jsonData);
});