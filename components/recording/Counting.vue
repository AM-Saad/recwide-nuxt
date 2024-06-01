
<script>
export default {
  data() {
    return {
      minutes: "00",
      seconds: "00",
      totalSeconds: 0,
    };
  },
  created() {
    this.startCounting();
  },
  methods: {
    startCounting() {
      setInterval(this.setTime, 1000);
    },
    setTime() {
      this.totalSeconds += 1;
      this.seconds = this.pad(this.totalSeconds % 60);
      this.minutes = this.pad(parseInt(this.totalSeconds / 60));
    },
    pad(val) {
      const valString = val + "";
      if (valString.length < 2) {
        return "0" + valString;
      } else {
        return valString;
      }
    },
  },
};
</script>

<template>
  <p class="timer">
    <label id="minutes" ref="minutes">{{ minutes }}</label>
    <label id="colon">:</label>
    <label id="seconds" ref="seconds">{{ seconds }}</label>
  </p>
</template>

<style scoped>
.timer {
  text-align: center;
}

#seconds {
  font-size: 5em;
}

#minutes {
  font-size: 5em;
}

#colon {
  font-size: 5em;
}
</style>
