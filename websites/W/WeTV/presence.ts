class WeTV extends Presence {
	constructor(options: PresenceOptions) {
		super(options);
	}

	getTitle() {
		// eslint-disable-next-line no-one-time-vars/no-one-time-vars
		const JSONData: {
			"@graph": {
				name: string;
			}[];
		} = JSON.parse(
			document.querySelector('[type="application/ld+json"]').textContent
		);

		return JSONData["@graph"][0].name;
	}

	getMovieTitle() {
		return document.querySelector(".play-relevant__link").getAttribute("title");
	}

	getEpisodeTitle() {
		const Element = document.querySelector(
			".play-relevant__item.play-relevant__item--selected"
		);

		if (Element) return Element.children[2].textContent;
	}

	getEpisodeNumber() {
		return document
			.querySelector(".play-video__item.play-video__item--selected")
			?.textContent.match(/[1-9][0-9]?[0-9]?/)[0];
	}

	isMovie() {
		return this.getTitle() === this.getMovieTitle();
	}

	isClip() {
		return this.getTitle() !== this.getEpisodeTitle();
	}
}

const presence = new WeTV({
	clientId: "840271335183351902",
});

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		details: "Browsing...",
		largeImageKey: "https://cdn.rcd.gg/PreMiD/websites/W/WeTV/assets/logo.png",
		smallImageKey: "browse",
	};

	if (document.location.pathname.includes("/play/")) {
		const video = document.querySelector("video");

		if (video) {
			presenceData.details = presence.getTitle();
			presenceData.endTimestamp = presence.getTimestampsfromMedia(video).pop();

			presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
			presenceData.smallImageText = video.paused ? "Paused" : "Playing";

			if (video.paused) delete presenceData.endTimestamp;

			if (presence.isMovie()) {
				presenceData.state = "Movie";

				if (presence.isClip()) presenceData.state = "Clip";
			} else if (presence.getEpisodeNumber())
				presenceData.state = `Episode ${presence.getEpisodeNumber()}`;
			else presenceData.state = presence.getEpisodeTitle();
		} else {
			presenceData.details = "Viewing:";
			presenceData.state = presence.getTitle();
		}
	} else if (document.location.pathname.endsWith("/search")) {
		presenceData.details = "Searching for:";
		presenceData.state = document.querySelector("input").value;
	}

	presence.setActivity(presenceData);
});
