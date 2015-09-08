/**
 * Created by Philippe Simpson on 06-09-2015.
 */

// Model class for each card item:
var CardModel = Backbone.Model.extend({
    defaults: {
        url: "https://www.trustpilot.com/review/www.trustpilot.com/55ee48b00000ff0009064ac0" // specific review url not provided, so we add one.
    }
});

// Collection class for the card item list:
var CardCollection = Backbone.Collection.extend({
    model: CardModel
});

// View class for displaying each card item:
var CardItemView = Backbone.View.extend({
    className: 'card',
    template: _.template($('#review-card-template').html()),

    initialize: function() {
        //this.listenTo(this.model, 'destroy', this.remove)
        var profilesrc = this.model.get('firstName').toLowerCase() + ( this.model.get('lastName').length ? "-" + this.model.get('lastName').toLowerCase() : "" ) + ".png";
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

// View class for displaying Trustscore:
var SummeryView = Backbone.View.extend({
    template: _.template($('#summery-template').html()),

    initialize: function() {
        // lacking real review summery data we construct some out of the provided sample reviews:
        var sum = this.collection.pluck("starRating").reduce(function(previousValue, currentValue, index, array) {
            return parseInt(previousValue) + parseInt(currentValue);
        });
        var avg = sum / this.collection.length;
        var cssclass;

        switch(avg) {
            case 1:
                cssclass = "star-red";
                break;
            case 2:
                cssclass = "star-orange";
                break;
            case 3:
                cssclass = "star-yellow";
                break;
            case 4:
                cssclass = "star-green";
                break;
            case 5:
                cssclass = "star-darkgreen";
                break;
            default:
                cssclass = "";
        }

        this.model.set({
            average: avg,
            base: this.collection.length,
            cssclass: cssclass
        });
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));

        this.animateStars(0);

        return this;
    },

    animateStars: function(index){
        var starEl = this.$el.find(".star").eq(index);
        _.delay(this.showStar, 300, starEl, index, this);
    },

    showStar: function(el, index, that){
        // this function is out of scope when envoked: use passed 'that'.

        el.addClass(that.model.get('cssclass'));
        if(index < that.model.get('average') - 1) that.animateStars(index + 1);
    },

    events: {
        //'click .remove': 'onRemove'
    }
});

var count = 0;
var cardsCollection;

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

    $('.nav a').click(this.nextCard);
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
// ...imagine loading json data file from web server - instead, to avoid cross-domain issue we include the data in the header.
startWidget(reviewsData);