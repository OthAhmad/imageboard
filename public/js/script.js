(function() {
    Vue.component("first-component", {
        data: function() {
            return {
                image: [],
                previousid: null,
                nextid: null
            };
        },
        template: "#pop-up",
        props: ["imageid"],
        mounted: function() {
            var self = this;
            axios
                .get("/image/" + this.imageid)
                .then(function(response) {
                    self.image = response.data[0];
                    self.previousid = response.data[0].previous_id;
                    self.nextid = response.data[0].next_id;
                })
                .catch(function(err) {
                    console.log(err);
                    location.hash = "";
                });
        },
        watch: {
            imageid: function() {
                var self = this;
                axios
                    .get("/image/" + this.imageid)
                    .then(function(response) {
                        self.image = response.data[0];
                        self.previousid = response.data[0].previous_id;
                        self.nextid = response.data[0].next_id;
                    })
                    .catch(function(err) {
                        console.log(err);
                        self.$emit("closepopup");
                        location.hash = "";
                    });
            }
        },
        methods: {
            closePopUp: function() {
                this.$emit("closepopup");
                location.hash = "";
            },
            previousimage: function() {
                location.hash = this.nextid;
            },
            nextimage: function() {
                location.hash = this.previousid;
            }
        }
    });

    Vue.component("second-component", {
        data: function() {
            return {
                comments: [],
                comment: "",
                username: ""
            };
        },
        template: "#comments",
        props: ["imageid", "image"],
        watch: {
            imageid: function() {
                var self = this;
                axios
                    .get("/get-comments/" + this.imageid)
                    .then(response => {
                        self.comments = [];
                        if (response.data.length) {
                            self.comments = response.data;
                        } else {
                            return;
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        },
        mounted: function() {
            var self = this;
            axios
                .get("/get-comments/" + this.imageid)
                .then(response => {
                    self.comments = [];
                    if (response.data.length) {
                        self.comments = response.data;
                    } else {
                        return;
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        methods: {
            submitComment: function() {
                console.log("submited");
                var self = this;
                if (self.comment != "" && self.username != "") {
                    axios
                        .post("/comment/add", {
                            imageid: self.imageid,
                            comment: self.comment,
                            username: self.username
                        })
                        .then(function(response) {
                            self.comments.push(response.data[0]);
                            self.comment = null;
                            self.username = null;
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                }
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            imageid: location.hash.slice(1),
            lowestid: null,
            image: [],
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            }
        }, //end data
        mounted: function() {
            var self = this;
            axios.get("/images").then(function(response) {
                if (response.data.length) {
                    self.images = response.data;
                    self.lowestid = response.data[0].lowest_id;
                } else {
                    return;
                }
            });
            window.addEventListener("hashchange", function() {
                self.imageid = location.hash.slice(1);
            });
        },
        methods: {
            uploadFile: function(e) {
                e.preventDefault();
                var file = document.getElementById("file");
                var uploadedFile = file.files[0];
                var formData = new FormData();
                formData.append("file", uploadedFile);
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);
                var self = this;
                axios
                    .post("/upload", formData)
                    .then(function(response) {
                        self.error = null;
                        self.images.unshift(response.data);
                        if (self.images.length > 9) {
                            console.log(self.images.length);
                            self.images = self.images.slice(0, 9);
                        }
                        self.form.title = null;
                        self.form.description = null;
                        self.form.username = null;
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },
            setImageId: function(e) {
                this.imageid = e.target.id;
            },
            doclosepopup: function() {
                this.imageid = null;
            },
            send: function(image) {
                this.image = image;
            },
            moreImages: function() {
                var self = this;
                var lastId = this.images[this.images.length - 1].id;
                axios
                    .get("/images/more/" + lastId)
                    .then(function(response) {
                        self.images = self.images.concat(response.data);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        }
    });
})();
