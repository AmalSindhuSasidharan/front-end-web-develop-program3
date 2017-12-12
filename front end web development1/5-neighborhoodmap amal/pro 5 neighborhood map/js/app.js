var locations = [{
        title: "Hill Palace Museum",
        location: {
            lat: 9.9526386,
            lng: 76.3639139
        },
        id: '4dcb88f045dd38312287413e'
    },
    {
        title: "Hindutemple Sree Poornathrayeesa temple",
        location: {
            lat: 9.9450109,
            lng: 76.342111
        },
        id: '4bf894124a67c9284cb725cf'

    },
    {
        title: "RLV College of Fine Arts",
        location: {
            lat: 9.9422187,
            lng: 76.3449798
        },
        id: '4d3401d82c76a1436cbb80c7'
    },
    {
        title: "Vegetarisches Sree Saravana Bhavan",
        location: {
            lat: 9.9533481,
            lng: 76.3408252
        },
        id: '54031e63498e50e6e1f2db8f'
    },
    // {
    //   title: "Govt. Ayurveda Hospital",
    //   location: {
    //     lat: 9.9248246,
    //     lng: 76.3586416
    //   }
    // },
    {
        title: "Vyttila Mobility Hub",
        location: {
            lat: 9.9686167,
            lng: 76.3214095
        },
        id: '4eae33d8f5b936710bcd2558'
    },
    // {
    //   title: "State Bank Of India",
    //   location: {
    //     lat: 9.9518318,
    //     lng: 76.3404544
    //   }
    // },
    {
        title: "Wonderla",
        location: {
            lat: 10.027077,
            lng: 76.39163
        },
        id: '4f9246eee4b02d470255e414'
    },
    {
        title: "LuLu Mall",
        location: {
            lat: 10.0270753,
            lng: 76.3080901
        },
        id: '514818dee4b0efe8086c19c2'
    }

];

var initMap = function() {
    var self = this;
    // added map to page
    map = new google.maps.Map(document.getElementById('mapview'), {
        center: {
            lat: 9.980092899999999,
            lng: 76.379904
        },
        zoom: 12
    });

    ko.applyBindings(new ViewModel());

};

var markers = ko.observableArray();

var ViewModel = function() {

    var self = this;
    var largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }



    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var id = locations[i].id;

        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            rating: '',
            image: '',
            id: id
            // visible:true

        });
        // marker.visible = ko.observable(true);
        markers.push(marker);
    }




    markers().forEach(function(marker) {
        // Create an onclick event to open the large infowindow at each marker and make it bounce .
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            makeBounce(this);
        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener("mouseover", function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener("mouseout", function() {
            this.setIcon(defaultIcon);
        });

    });




    // bounce marker when click on it

    function makeBounce(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 700);
    }




    // adding 3rd party functionality...ie, foursquare for displaying rating of each Place
    // get rating for each marker
    markers().forEach(function(mar) {
        // passing mar for marker
        $.ajax({
            method: 'GET',
            dataType: "json",
            url: "https://api.foursquare.com/v2/venues/" + mar.id + "?client_id=BSFHXUHVRPZHLMNLZOWAADA2KP03CNT1QKZTZFPD1RXU215V&client_secret=XBYGT3W2T1WKEREYFY01AJJRLK5XXMWX5O2POUJHXJNNFRMW&v=20170303",
            success: function(data) { // if data is successfully fetch function will execute
                var venue = data.response.venue;
                var imgurl = data.response.venue.photos.groups[0].items[0];
                if (((imgurl.hasOwnProperty('prefix')) && (imgurl.hasOwnProperty('suffix')))) {
                    mar.image = imgurl.prefix + "100x100" + imgurl.suffix;
                } else {
                    mar.imgurl = '';
                }
            },
            error: function(e) { //if any error occur in fetching data
                alert('There is some error in fetching data');
            }
        });
    });




    // show infowindow when marker is selected
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3></div><div><img src="' + marker.image + '"></div>');
            // infowindow.setContent('<div>' +'<h3>' + marker.title +'</h3>'+'</div>');
            infowindow.open(map, marker);

            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });


        }
    }
    this.listclick = function(marker) {
        populateInfoWindow(marker, largeInfowindow);
        makeBounce(marker);

    };

    this.searchTerm = ko.observable("");


    this.filteredList = ko.computed(function() {
        var filter = this.searchTerm().toLowerCase();
        if (!filter) {
            markers().forEach(function(marker) {
                marker.setVisible(true);
            });
            return markers();

        } else {
            return ko.utils.arrayFilter(markers(), function(item) {
                var itIsAMatch = item.title.toLowerCase().indexOf(filter) > -1; // true or false
                item.setVisible(itIsAMatch);
                return itIsAMatch;
            });
        }
    }, this);

};

function googleError() {
    alert("google not loaded");
}