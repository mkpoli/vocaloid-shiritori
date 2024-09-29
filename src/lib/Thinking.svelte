<div class="inline-flex gap-1" id="thinking">
	<div class="flex h-4 w-4 flex-col gap-4 rounded-full bg-gray-300"></div>
	<div class="flex h-4 w-4 flex-col gap-4 rounded-full bg-gray-300"></div>
	<div class="flex h-4 w-4 flex-col gap-4 rounded-full bg-gray-300"></div>
</div>

<style>
	@keyframes blink {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes resize {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.6);
		}
		100% {
			transform: scale(1);
		}
	}

	#thinking > div {
		animation:
			blink 1.5s infinite cubic-bezier(0.5, 0, 0.5, 1) alternate,
			resize 1.5s infinite cubic-bezier(0.5, 0, 0.5, 1) alternate;
	}

	#thinking > div:nth-child(1) {
		animation-delay: 0s;
	}

	#thinking > div:nth-child(2) {
		animation-delay: 0.1s;
	}

	#thinking > div:nth-child(3) {
		animation-delay: 0.2s;
	}
</style>
