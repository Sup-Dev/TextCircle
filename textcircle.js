this.Documents = new Mongo.Collection("documents");
EditingUsers =  new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

    Template.editor.helpers({
        docid: function() {
            var doc = Documents.findOne();
            if (doc) {
                return doc._id;
            }
            else {
                return undefined;
            }
        },
        config: function() {
            return function (editor) {
                editor.setOption("lineNumbers", true);
                editor.setOption("mode", "html");
                editor.on("change", function(cm_editor, info) {
                    $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
                    Meteor.call("addEditingUser");
                });
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

Meteor.methods({
    addEditingUser: function() {
        var doc, user, eusers;
        doc = Documents.findOne();

        // no doc give up
        if (!doc) {
            return;
        }
        // no logged in user give up
        if (!this.userId) {
            return;
        }
        // now I have a doc and possibly a user
        user = Meteor.user().profile;
        eusers = EditingUsers.findOne({docid:doc._id});
        if (!eusers) {
            eusers = {
                docid: doc._id,
                users: {}
            };
        }
        user.lastEdit = new Date();
        eusers.users[this.userId] = user;

        EditingUsers.upsert({_id:eusers._id}, eusers);
    }
});
