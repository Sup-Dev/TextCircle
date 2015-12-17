this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient) {

}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        if (!Documents.findOne()) {
            Documents.insert({title: "my new document"});
        }

    });
}
