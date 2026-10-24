export function useBackgroundMusicState() {
  return {
    muted: useState('music:muted', () => false),
    paused: useState('music:paused', () => false),
    playing: useState('music:playing', () => false),
    failed: useState('music:failed', () => false),
    command: useState('music:command', () => 0),
  };
}

export function useBackgroundMusic() {
  const state = useBackgroundMusicState();

  function rememberMute() {
    if (import.meta.server) return;
    try {
      localStorage.setItem('adventure-oracle-music', JSON.stringify({ enabled: !state.muted.value }));
    } catch { /* Browser storage is optional for playback. */ }
  }

  function pause() {
    state.paused.value = true;
    state.command.value++;
  }

  function resume() {
    state.paused.value = false;
    state.command.value++;
  }

  function mute() {
    state.muted.value = true;
    rememberMute();
  }

  function unmute() {
    state.muted.value = false;
    state.command.value++;
    rememberMute();
  }

  function toggleMute() {
    if (state.muted.value) unmute();
    else mute();
  }

  return {
    isPlaying: readonly(state.playing),
    isMuted: readonly(state.muted),
    isPaused: readonly(state.paused),
    hasError: readonly(state.failed),
    play: resume,
    resume,
    pause,
    mute,
    unmute,
    toggleMute,
  };
}
