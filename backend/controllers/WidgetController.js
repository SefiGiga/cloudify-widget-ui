'use strict';
var managers = require('../managers');
var _ = require('lodash');
var logger = require('log4js').getLogger('WidgetController');

exports.list = function (req, res) {

    logger.info('getting widgets for user [%s], [%s]', req.user.email, req.user._id);
    managers.db.connect('widgets', function (db, collection, done) {
        collection.find({userId: req.user._id}).toArray(function (err, result) {

            if (!!err) {
                res.send(500, {'message': err.message});
                done();
                return;
            } else {
                res.send(result);
                done();
                return;
            }
        });
    });
};

function getWidgetPublicParams(widget) {
    var result = _.pick(widget, 'showAdvanced', 'embedVideoSnippet', 'productName', 'productVersion', 'title', 'providerUrl', '_id', 'login', 'showAdvanced', 'socialLogin','theme');
    if (result.hasOwnProperty('socialLogin')) {
        result.socialLogin = _.pick(result.socialLogin, 'data');
    }
    return result;

}

exports.getPublicInfo = function (req, res) {
    var widgetId = req.params.widgetId;


    managers.db.connect('widgets', function (db, collection, done) {
        collection.findOne({ '_id': managers.db.toObjectId(widgetId)}, function (err, result) {
            if (!!err) {
                res.send(500, {'message': 'unable to find widget' + err.message});
                done();
                return;
            }
            if (!result || !!result.disabled) { // by default widgets should be enabled.
                res.send(404, { 'message': 'unable to find widget with id ' + widgetId});
                done();
                return;
            }

            res.send(getWidgetPublicParams(result));
        });
    });


};

exports.read = function (req, res) {
    var widgetId = req.params.widgetId;

    var widgetFilter = { '_id': managers.db.toObjectId(widgetId) };

    if (!req.user.isAdmin) {
        widgetFilter.userId = req.user._id;
    }

    managers.db.connect('widgets', function (db, collection, done) {
        collection.findOne(widgetFilter, function (err, result) {
            if (!!err) {
                res.send(500, {'message': 'unable to find widget ' + err.message});
                done();
                return;
            }

            if (!result) {
                res.send(404, {'message': 'widget ' + widgetId + ' not found for user ' + req.user.email });
                done();
                return;
            }

            res.send(result);
            done();
            return;
        });
    });
};

exports.delete = function (req, res) {
    var widgetId = req.params.widgetId;
    managers.db.connect('widgets', function (db, collection, done) {
        collection.remove({'userId': req.user._id, '_id': managers.db.toObjectId(widgetId)}, function (err) {
            if (!!err) {
                res.send(500, {'message': 'unable to delete widget ' + widgetId + ' :: ' + err.message});
                done();
                return;
            }
            res.send(200, {'message': 'deleted successfully'});

        });
    });
};

exports.play = function (req, res) {
    logger.info('calling widget play for user id [%s], widget id [%s], remote [%s]', req.user._id, req.params.widgetId, req.body.remote);

    if (!req.params.widgetId) {
        logger.error('unable to play, no widget id found on request');
        res.send(500, {message: 'no widget id found on request'});
        return;
    }

    var playCallback = function (err, result) {
        if (!!err) {
            logger.error('play failed', err);
            res.send(500, {message: 'play failed', error: err});
            return;
        }

        if (!result) {
            logger.error('unable to get execution id');
            res.send(500, {message: 'unable to get execution id'});
            return;
        }

        logger.info('widget play initiated successfully, execution id is [%s]', result);
        res.send(200, result);
    };

    if (req.body.remote) {
        managers.widget.playRemote(req.params.widgetId, req.user.poolKey, req.body.advancedParams, playCallback);
    } else {
        managers.widget.play(req.params.widgetId, req.user.poolKey, playCallback);
    }
};

exports.stop = function (req, res) {
    logger.info('calling widget stop. user id [%s], widget id [%s], execution id [%s]', req.user._id, req.params.widgetId, req.params.executionId);

    if (!req.params.widgetId) {
        logger.error('unable to stop widget, no widget id found on request');
        res.send(500, {message: 'no widget id found on request'});
        return;
    }

    if (!req.params.executionId) {
        logger.error('unable to stop widget, no execution id found on request');
        res.send(500, {message: 'no execution id found on request'});
        return;
    }

    managers.widget.stop(req.params.widgetId, req.user.poolKey, req.params.executionId, req.body.remote, function (err, result) {
        if (!!err) {
            logger.error('stop widget failed', err);
            res.send(500, {message: 'stop widget failed', error: err});
            return;
        }
        res.send(200, result);
    });

};


function verifyRequiredFields(fields, widget, errors) {

    for (var i in fields) {
        var field = fields[i];
        if (!widget.hasOwnProperty(field) || widget[field].trim().length === 0) {
            errors.push({ message: (field + ' is missing')});
        }

    }
}

function validateWidget(widget) {
    var errors = [];

    verifyRequiredFields(['productName', 'productVersion', 'title', 'recipeName', 'providerUrl'], widget, errors);

    return errors;
}

exports.create = function (req, res) {
    logger.info('creating new widget');
    var widget = req.body;

    var errors = validateWidget(widget);
    if (errors.length > 0) {
        logger.info('widget found illegal  [%s]', JSON.stringify(errors));
        res.send(500, { 'errors': errors });
        return;
    }

    widget.userId = req.user._id;

    managers.db.connect('widgets', function (db, collection) {
        collection.insert(widget, function (err, obj) {
            if (!!err) {
                res.send(500, {'message': err.message});
            }

            res.send(obj);
        });
    });
};

exports.update = function (req, res) {
    var updatedWidget = req.body;

    if (updatedWidget.userId !== req.user._id.toString()) {
        res.send(401, {'message': 'you do not have permissions to modify this widget'});
    }

    var errors = validateWidget(updatedWidget);
    if (errors.length > 0) {
        logger.info('widget found illegal values [%s]', JSON.stringify(errors));
        res.send(500, {'errors': errors});
        return;
    }

    managers.db.connect('widgets', function (db, collection, done) {
        collection.findOne({_id: managers.db.toObjectId(updatedWidget._id), userId: req.user._id }, function (err, object) {
            if (!!err) {
                logger.error('unable to check if widget exists or not');
                res.send(500, {'message': err.message});
                done();
                return;
            }

            if (!object) {
                logger.error('unable to find a widget with this id that belongs to this user ' + updatedWidget._id + ' :: ' + req.user._id);
                res.send(404, {'message': 'widget is not found'});
                done();
                return;
            }

            logger.info('found the widget, it really does belong to the user. I am updating it');
            updatedWidget._id = managers.db.toObjectId(updatedWidget._id);
            updatedWidget.userId = managers.db.toObjectId(updatedWidget.userId);
            collection.update({_id: updatedWidget._id}, updatedWidget, {}, function (err, count) {

                if (!!err || count !== 1) {
                    logger.error('unable to update widget : ' + err.message);
                    res.send(500, {'message': err.message, 'count': count });
                    done();
                    return;
                }

                logger.info('updated the widget successfully. number of objects updated :: ' + count);
                res.send(200);
            });
        });

    });
};

/**
 * only exposes fields that can be exposed
 */
exports.getWidgetForPlayer = function (req, res) {
    var widgetId = req.params.widgetId;
    managers.db.connect('widgets', function (db, collection, done) {
        collection.findOne({_id: managers.db.toObjectId(widgetId)}, function (err, result) {
            if (!!err) {
                res.send(500, {'message': 'unable to get widget ' + err.message});
                done();
                return;
            }

            if (!result) {
                res.send(500, {'message': 'widget not found with ID : ' + widgetId });
                done();
                return;
            }

            res.send(result.publicProperties);
            done();
            return;
        });
    });
};

exports.getStatus = function (req, res) {
    logger.info('calling widget get status. user id [%s], widget id [%s], execution id [%s]', req.user._id, req.params.widgetId, req.params.executionId);

    if (!req.params.widgetId) {
        logger.error('unable to get output, no widget id found on request');
        res.send(500, {message: 'no widget id found on request'});
        return;
    }

    if (!req.params.executionId) {
        logger.error('unable to get output, no execution id found on request');
        res.send(500, {message: 'no execution id found on request'});
        return;
    }

    managers.widget.getStatus(req.params.executionId, function (err, status) {
        if (!!err) {
            logger.error('get status failed', err);
            res.send(500, {message: 'get status failed', error: err});
            return;
        }
        managers.widget.getOutput(req.params.executionId, function (err, output) {
//            if (!!err) {
//                logger.error('get output failed', err);
//                res.send(500, {message: 'get output failed', error: err});
//                return;
//            }
            if (!!output) {
                status.output = output;
            }
            res.send(200, status);
        });
    });

};


