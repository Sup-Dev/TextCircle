this.Documents = new Mongo.Collection("documents");
EditingUsers =  new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

    Template.editor.helpers({
        docid: function() {
            setupCurrentDocument();
            return Session.get("docid");
        },
        config: function() {
            return function (editor) {
                editor.setOption("lineNumbers", true);
                editor.setOption("mode", "html");
                editor.setOption("theme", "cobalt");
                editor.on("change", function(cm_editor, info) {
                    $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
                    Meteor.call("addEditingUser");
                });
            }
        }
    });

    Template.editingUsers.helpers({
        users: function() {
            var doc, eusers, users;
            doc = Documents.findOne();
            if (!doc) {
                return;
            }
            eusers = EditingUsers.findOne({docid: doc._id});
            if (!eusers) {
                return;
            }

            users = new Array();
            var i = 0;
            for (var user_id in eusers.users) {
                users[i] = fixObjectKeys(eusers.users[user_id]);
                i++;
            }
            return users;
        }
    });

    Template.navbar.events({
        "click .js-add-doc": function(event) {
            event.preventDefault();
            console.log("Add a new doc!");
            if (!Meteor.user()) {
                alert("You need to login first!");
            }
            else {
                // they are logged in... lets insert a doc
                Meteor.call("addDoc");
            }
        }
    })
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
    addDoc: function() {
        var doc;
        if (!this.userId) { // not logged in
            return;
        }
        else {
            doc = {owner: this.userId, createdOn: new Date(), title: "my new doc"};
            Documents.insert(doc);
        }
    },
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

function fixObjectKeys(obj) {
    var newObj = {};
    for (key in obj) {
        var key2 = key.replace("-", "");
        newObj[key2] = obj[key];
    }
    return newObj;
}

function setupCurrentDocument() {
    var doc;
    if (!Session.get("docid")) {
        doc = Documents.findOne();
        if (doc) {
            Session.set("docid", doc._id);
        }
    }
}