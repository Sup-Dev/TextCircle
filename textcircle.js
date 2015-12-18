this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient) {
    Template.date_display.helpers({
        current_date: function() {
           return new Date();
        }
    });

    Template.editor.helpers({
        docid: function() {
            var doc = Documents.findOne();
            if (doc) {
                return doc._id;
            }
            else {
                return undefined;
            }
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        if (!Documents.findOne()) {
            Documents.insert({title: "my new document"});
        }

    });
}
