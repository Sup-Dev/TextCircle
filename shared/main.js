Meteor.methods({
    addDoc: function() {
        var doc;
        if (!this.userId) { // not logged in
            return;
        }
        else {
            doc = {owner: this.userId, createdOn: new Date(), title: "my new doc"};
            var id = Documents.insert(doc);
            console.log("addDoc method: got an id");
            return id;
        }
    },
    updateDocPrivacy: function(doc) {
        console.log("updateDocPrivacy method");
        console.log(doc);
        var realDoc = Documents.findOne({_id: doc._id, owner: this.userId});
        if (realDoc) {
            realDoc.isPrivate = doc.isPrivate;
            Documents.update({_id: doc._id}, realDoc);
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

