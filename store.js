var store = window.store = {};
store = {
    set: function( key, value, options ) {

        if ( this.is_localstorage() ) {
            return this.local( key, value, options );
        } else {
            return this.cookie( key, value, options );
        }
    },

    get: function( key ) {

        if ( this.is_localstorage() ) {
            return this.local( key );
        } else {
            return this.cookie( key );
        }
    },

    remove: function( key ) {
        if ( ! key ) {
            return false;
        }

        localStorage.removeItem( key );
        this.cookie( key, '', { expires: -1 } );

        return true;
    },

    // LocaStorge
    local: function( key, value, options ) {

        if ( ! key ) {
            return false;
        }

        // Write
        if ( arguments.length > 1 ) {

            value = {
                value: value,
                expires: this.expiry( options.expires )
            };

            localStorage.setItem( key, JSON.stringify( value ) );

            return true;
        }

        // Read
        var item = localStorage.getItem( key );

        if ( ! item ) {
            return false;
        }

        item = JSON.parse( item );

        if ( item.expires && Date.now() > item.expires ) {
            localStorage.removeItem( key );
            return false;
        }

        return item.value;
    },

    // Cookies
    cookie: function( key, value, options ) {

        if ( ! key ) {
            return false;
        }

        // Write
        if ( arguments.length > 1 ) {

            options = $.extend( {}, {
                path: '/',
                expires: '30d'
            }, options );

            options.expires = this.expiry( options.expires );
            var date = new Date();
            date.setTime( options.expires );

            if ( 'object' === typeof value ) {
                value = JSON.stringify( value );
            }

            return ( document.cookie = [
                encodeURIComponent( key ) + '=' + encodeURIComponent( value ),
                options.expires ? '; expires=' + date.toUTCString() : '', // Use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join( '' ) );
        }

        // Read
        var cookies = document.cookie ? document.cookie.split( '; ' ) : [],
            rdecode = /(%[0-9A-Z]{2})+/g,
            i = 0,
            result = false;

        for ( ; i < cookies.length; i++ ) {

            var parts = cookies[i].split( '=' ),
                name = parts[0].replace( rdecode, decodeURIComponent ),
                cookie = parts.slice( 1 ).join( '=' );

            if ( key === name ) {

                if ( '"' === cookie.charAt( 0 ) ) {
                    cookie = cookie.slice( 1, -1 );
                }

                try {
                    cookie = cookie.replace( rdecode, decodeURIComponent );
                    try {
                        cookie = JSON.parse( cookie );
                    } catch ( e ) {}
                } catch ( e ) {}

                result = cookie;
                break;
            }
        }

        return result;
    },

    is_localstorage: function() {
        return 'undefined' !== typeof Storage;
    },

    expiry: function( val ) {

        if ( ! val ) {
            return false;
        }

        if ( -1 === val ) {
            var d = new Date();
            d.setYear( 1970 );
            return d.getTime();
        }

        var interval = parseInt( val ),
            unit = val.replace( interval, '' );

        if ( 'd' === unit ) {
            interval = interval * 24 * 60 * 60 * 1000;
        }

        if ( 'h' === unit ) {
            interval = interval * 60 * 60 * 1000;
        }

        if ( 'm' === unit ) {
            interval = interval * 60 * 1000;
        }

        if ( 's' === unit ) {
            interval = interval * 1000;
        }

        return Date.now() + interval;
    }
};
