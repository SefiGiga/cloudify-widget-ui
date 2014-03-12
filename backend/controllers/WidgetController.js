var managers = require('../managers');
var logger = require('log4js').getLogger('WidgetController');
var ObjectID = require('mongodb').ObjectID;

exports.list = function (req, res) {

    logger.info('getting widgets for user [%s], [%s]', req.user.email, req.user._id);
    managers.db.connect('widgets', function (db, collection, done) {
        collection.find({userId: req.user._id}).toArray( function (err, result) {

            if (!!err) {
                res.send(500, {'message': err.message});
                done();
                return;
            } else {
                res.send(result);
                done();
                return;
            }
        })
    })
};

exports.read = function( req, res ){
    var widgetId = req.params.widgetId;
    if ( isNaN(parseInt(widgetId)) ){
        logger.info('widget id is not a number ::' + widgetId);
        res.send(500, 'widgetId is not a number :: ' + widgetId);
        return;
    }
    managers.db.connect('widgets', function(db, collection, done){
       collection.findOne({'_id' : new ObjectID(widgetId), 'userId' : req.user._id }, function (err, result){
           if ( !!err ){
               res.send(500, {'message' : 'unable to find widget ' + err.message});
               done();
               return;
           }

           if ( !result ){
               res.send(404, {'message':'widget ' + widgetId + ' not found for user ' + req.user.email });
               done();
               return;
           }

           res.send(result);
           done();
           return;
       })
    });
};

exports.delete = function ( req, res ){
    var widgetId = req.params.widgetId;
    managers.db.connect('widgets', function(db, collection,done){
        collection.remove({'userId' : req.user._id, '_id' : new ObjectID(widgetId)}, function(err){
            if ( !!err ){
                res.send(500, {'message' : 'unable to delete widget ' + widgetId + " :: " + err.message});
                done();
                return;
            }
            res.send(200, {'message' : 'deleted successfully'});

        })
    });
};

function verifyRequiredFields( fields, widget, errors  ){

    for ( var i in fields ){
        var field = fields[i];
        if ( !widget.hasOwnProperty(field) || widget[field].trim().length == 0 ){
            errors.push({ 'message' : (field + ' is missing')});
        }

    }
}

function validateWidget( widget ){
    var errors = [];

    verifyRequiredFields( ['productName','productVersion','title','recipeName','providerUrl'], widget, errors);

    return errors;
}

exports.create = function( req, res ){
    logger.info('creating new widget');
    var widget = req.body;

    var errors = validateWidget( widget );
    if ( errors.length > 0 ){
        logger.info('widget found illegal  [%s]' , JSON.stringify(errors));
        res.send(500, { 'errors' : errors } );
        return;
    }

    widget.userId = req.user._id;

    managers.db.connect('widgets', function(db, collection, done){
        collection.insert(widget, function( err, obj ){
            if ( !!err ){
                res.send(500, {'message':err.message});
            }

            res.send(obj);
        })
    })
};

exports.update = function( req, res ){
    var updatedWidget = req.body;

    if ( updatedWidget.userId !== req.user._id.toString() ){
        res.send(401, {'message' :'you do not have permissions to modify this widget'});
    }

    var errors = validateWidget( updatedWidget );
    if ( errors.length > 0 ){
        logger.info('widget found illegal values [%s]', JSON.stringify(errors));
        res.send(500, {'errors' : errors});
        return;
    }

    managers.db.connect('widgets', function(db, collection, done){
        collection.findOne( {_id: new ObjectID(updatedWidget._id), userId: req.user._id }, function(err, object){
            if ( !!err ){
                logger.error('unable to check if widget exists or not');
                res.send(500, {'message' : err.message});
                done();
                return;
            }

            if ( !object ){
                logger.error('unable to find a widget with this id that belongs to this user ' + updatedWidget._id + ' :: ' + req.user._id );
                res.send(404, {'message' : 'widget is not found'});
                done();
                return;
            }

            debugger;
            logger.info('found the widget, it really does belong to the user. I am updating it');
            updatedWidget._id = new ObjectID(updatedWidget._id);
            updatedWidget.userId = new ObjectID( updatedWidget.userId);
            collection.update({_id : updatedWidget._id}, updatedWidget , {}, function( err, count ){

                if ( !!err || count != 1 )  {
                    logger.error('unable to update widget : ' + err.message);
                    res.send(500, {'message' : err.message, 'count' : count });
                    done();
                    return;
                }

                logger.info('updated the widget successfully. number of objects updated :: ' + count);
                res.send(200);
            })
        })

    })
};

/**
 * only exposes fields that can be exposed
 */
exports.getWidgetForPlayer = function (req, res) {
    var widgetId = req.params.widgetId;
    managers.db.connect('widgets', function (db, collection, done) {
        collection.findOne({_id: new ObjectID(widgetId)}, function (err, result) {
            if (!!err) {
                res.send(500, {'message': 'unable to get widget ' + err.message});
                done();
                return;
            }

            if ( !result ){
                res.send(500, {'message': 'widget not found with ID : ' + widgetId });
                done();
                return;
            }

            res.send( result.publicProperties );
            done();
            return;
        });
    });
};