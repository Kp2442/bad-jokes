import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import { v4 as uuid } from "uuid";
import Joke from "./Joke";

export default class JokeList extends Component {
	static defaultProps = {
		numJokes: 10,
	};
	state = {
		jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
		loading: window.localStorage.length === 0,
	};
	seenJokes = new Set(this.state.jokes.map(joke => joke.text));
	componentDidMount() {
		if (this.state.jokes.length === 0) this.getJokes();
	}
	async getJokes() {
		let jokes = [];
		while (jokes.length < this.props.numJokes) {
			let res = await axios.get("https://icanhazdadjoke.com/", {
				headers: { Accept: "application/json" },
			});
			let newJoke = res.data.joke;
			if (!this.seenJokes.has(newJoke)) {
				jokes.push({ id: uuid(), text: res.data.joke, votes: 0 });
			}
		}
		this.setState(
			st => ({
				jokes: [...st.jokes, ...jokes],
				loading: false,
			}),
			() =>
				window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
		);
	}
	upvote = id => {
		this.setState(
			st => ({
				jokes: st.jokes.map(joke => {
					return joke.id === id ? { ...joke, votes: joke.votes + 1 } : joke;
				}),
			}),
			() =>
				window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
		);
	};
	downvote = id => {
		this.setState(
			st => ({
				jokes: st.jokes.map(joke => {
					return joke.id === id ? { ...joke, votes: joke.votes - 1 } : joke;
				}),
			}),
			() =>
				window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
		);
	};
	handleClick = () => {
		this.setState({ loading: true }, this.getJokes);
	};
	render() {
		if (this.state.loading) {
			return (
				<div className="JokeList-spinner">
					<i className="far fa-8x fa-laugh fa-spin" />
					<h1 className="JokeList-title">Loading...</h1>
				</div>
			);
		}
		let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
		return (
			<div className="JokeList">
				<div className="JokeList-sidebar">
					<h1 className="JokeList-title">
						<span>Bad</span> Jokes
					</h1>
					<img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
					<button className="JokeList-button" onClick={this.handleClick}>
						Fetch Jokes
					</button>
				</div>
				<div className="JokeList-jokes">
					{jokes.map(joke => {
						return (
							<Joke
								id={joke.id}
								votes={joke.votes}
								text={joke.text}
								key={joke.id}
								upvote={this.upvote}
								downvote={this.downvote}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}
