<template>
  <div class="flex justify-around w-full overflow-hidden text-3xl text-center pointer-events-none">
    <span v-for="i in 40" class="relative flex-shrink-0 inline-block duration-1000"></span>
  </div>
</template>

<style scoped>
  span {
    animation-fill-mode: both;
    animation-iteration-count: infinite;
    width: 0.4em;
    height: 0.5em;
    margin: 1.4em 0.8em;
    border-radius: 50%;
    background: rgba(0, 247, 165, 1);
    box-shadow: 0px 0.3em 3em rgba(0, 247, 165, 1);
    animation-name: flash-1;
    animation-duration: 2s;
  }
  span:nth-child(2n + 1) {
    background: rgba(0, 255, 255, 1);
    box-shadow: 0px 0.3em 3em rgba(0, 255, 255, 0.5);
    animation-name: flash-2;
    animation-duration: 0.4s;
  }
  span:nth-child(4n + 2) {
    background: rgba(247, 0, 148, 1);
    box-shadow: 0px 0.3em 3em rgba(247, 0, 148, 1);
    animation-name: flash-3;
    animation-duration: 1.1s;
  }
  span:nth-child(odd) {
    animation-duration: 1.8s;
  }
  span:nth-child(3n + 1) {
    animation-duration: 1.4s;
  }
  span:before {
    content: '';
    position: absolute;
    background: #222;
    width: 100%;
    height: 0.6em;
    border-radius: 0.1em;
    top: -0.5em;
    left: 0;
  }
  span:after {
    content: '';
    top: -1em;
    left: 0;
    position: absolute;
    width: 3em;
    height: 1.2em;
    border-bottom: solid #222 2px;
    border-radius: 50%;
  }
  span:last-child:after {
    content: none;
  }
  span:first-child {
    margin-left: -3em;
  }
  @keyframes flash-1 {
    0%,
    100% {
      background: rgba(0, 247, 165, 1);
      box-shadow: 0px 0.3em 2em 0.25em rgba(0, 247, 165, 1);
    }
    50% {
      background: rgba(0, 247, 165, 0.4);
      box-shadow: 0px 0.3em 2em 0.25em rgba(0, 247, 165, 0.2);
    }
  }
  @keyframes flash-2 {
    0%,
    100% {
      background: rgba(0, 255, 255, 1);
      box-shadow: 0px 0.3em 2em 0.25em rgba(0, 255, 255, 1);
    }
    50% {
      background: rgba(0, 255, 255, 0.4);
      box-shadow: 0px 0.3em 2em 0.25em rgba(0, 255, 255, 0.2);
    }
  }
  @keyframes flash-3 {
    0%,
    100% {
      background: rgba(247, 0, 148, 1);
      box-shadow: 0px 0.3em 2em 0.25em rgba(247, 0, 148, 1);
    }
    50% {
      background: rgba(247, 0, 148, 0.4);
      box-shadow: 0px 0.3em 2em 0.25em rgba(247, 0, 148, 0.2);
    }
  }
</style>
