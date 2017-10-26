// Création du serveur ExpressJS
var app = require("express")();
var http = require("http").Server(app);
// Utilisation de SocketIO pour gérer les WebSockets
var io = require("socket.io")(http);
// Utilisation de Faker pour créer des données aléatoires
var faker = require("faker");

app.get("/", function(req, res){
	res.json({"status": "online"});
})

// Types d'événements possibles
var types = ["blesse", "mort", "bouchon", "travaux"];

// Lors d'une connexion par socket
io.on("connection", function(socket){
	console.log("Connexion from a user");
});

// Fonction qui renvoie un nombre aléatoire entre min et max inclus
function getRandomInclusive(min, max) {
	return (Math.random() * (max - min)) + min;
}

// Fonction qui permet de créer une notification 
function createRandomNotification(){
	// On créé une fausse notification quelque part vers Montpellier (France)
	return {
		id: Date.now(),
		type: faker.random.arrayElement(types),
		description: faker.lorem.paragraph(),
		position: {lat: getRandomInclusive(43.58, 43.63), lng: getRandomInclusive(3.77, 3.95)},
		confirmations: Math.floor(getRandomInclusive(0,15)),
		infirmations: Math.floor(getRandomInclusive(0,15))
	};
}

// Fonction qui permet d'envoyer à tous les écouteurs par socket une notification
function sendNotification(){
	// On "broadcast" la notification créée avec des fakes datas
	io.emit("event-notification", createRandomNotification());
}

// Fonction qui créé l'intervale de temps
function beginInterval(){
	// Toutes les X secondes, on appelle sendNotification
	setInterval(sendNotification, Math.floor(getRandomInclusive(3000, 10000)));
}

// Lancement du serveur
const PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
	console.log("listening on *:" +PORT);
	beginInterval();
});