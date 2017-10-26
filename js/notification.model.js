export class Notification {
	constructor(id = "", type, description, position, confirmations = 0, infirmations = 0){
		this.id = id;
		this.type = type;
		this.description = description;
		this.position = position;
		this.confirmations = confirmations;
		this.infirmations = infirmations;
	}

	save(){
		return fetch(`https://vanilla-tinder.firebaseio.com/notifications/${this.id}.json`, {
			method: "PUT",
			body: JSON.stringify(this)
		});
	}

	update(){
		return fetch(`https://vanilla-tinder.firebaseio.com/notifications/${this.id}.json`, {
			method: "PATCH",
			body: JSON.stringify(this)       
		});
	}

	// Permet de charger les notifications qui sont dans Firebase
	static loadAll(){
		return fetch("https://vanilla-tinder.firebaseio.com/notifications.json")
			.then(response => response.json())
			.then(notifications => Object.keys(notifications).map(key => {
				// Data porte les données de la notification
				const data = notifications[key];
				// Nous créons un nouvel objet Notification à partir des données récupérées
				return new Notification(data.id, data.type, data.description, data.position, data.confirmations, data.infirmations);
			}));
	}
}