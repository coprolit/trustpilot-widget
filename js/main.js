/**
 * Carousel widget for Trustpilot developer challenge.
 * Created by Philippe Simpson on 06-09-2015.
 */
(function () {

    var count = 0;
    var cardsCollection;

    // Model class for each review item:
    var CardModel = Backbone.Model.extend({
        defaults: {
            url: "https://www.trustpilot.com/review/www.trustpilot.com/55ee48b00000ff0009064ac0" // specific review url not provided, so we add one.
        }
    });

    // Collection class for the review items:
    var CardCollection = Backbone.Collection.extend({
        model: CardModel
    });

    // View class for displaying each review item:
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
        }
    });

    // View class for displaying the product Trustscore:
    var SummeryView = Backbone.View.extend({
        template: _.template($('#summery-template').html()),

        initialize: function() {
            // lacking real review summery data we construct some out of the provided sample reviews:
            var sum = this.collection.pluck("starRating").reduce(function(previousValue, currentValue, index, array) {
                return parseInt(previousValue) + parseInt(currentValue);
            });
            var avg = sum / this.collection.length; // the average rating.
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

            this.animateStars(0); // start animation sequence of review rating stars

            return this; // enable chaining
        },

        animateStars: function(index){
            var starEl = this.$el.find(".star").eq(index);
            _.delay(this.showStar, 300, starEl, index, this);
        },

        showStar: function(el, index, that){
            // this function is out of scope when envoked - use passed 'that'.
            el.addClass(that.model.get('cssclass')); // add color to star according to average rating.
            if(index < that.model.get('average') - 1) that.animateStars(index + 1);
        }
    });

    function startWidget(data){
        cardsCollection = new CardCollection(data);

        var summeryView = new SummeryView({
            model: new Backbone.Model(),
            collection: cardsCollection
        });
        var cont = $('.summery');
        cont.empty();
        cont.append(summeryView.render().$el);

        var rndIndex = Math.round(Math.random() * (cardsCollection.length - 1));
        showCard(cardsCollection.at(rndIndex));

        $('.nav .next').click(nextCard);
        $('.nav .prev').click(prevCard);
    }

    function nextCard(){
        count = count < cardsCollection.length-1 ? count + 1 : 0; // increment count
        showCard(cardsCollection.at(count));
    }
    function prevCard(){
        count = count === 0 ? cardsCollection.length-1 : count - 1; // increment count
        showCard(cardsCollection.at(count));
    }

    function showCard(model){
        var cardView = new CardItemView({model: model});
        var cont = $('.review');
        cont.empty();
        cont.append(cardView.render().$el);
    }

    // Load data and start widget:
    // ...here we imagine loading a json file from the web server
    // ...instead, to avoid the cross-domain issue we 'cheat' and include the data in the header.
    startWidget(reviewsData);
})();