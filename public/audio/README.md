# Mystery Forest

- **Title:** Mystery Forest
- **Author:** Alexandr Zhelanov
- **Artist:** https://soundcloud.com/alexandr-zhelanov
- **Source:** https://opengameart.org/content/mystery-forest
- **Downloaded recording:** https://opengameart.org/sites/default/files/Mystery%20Forest.mp3
- **License:** CC BY 3.0 Unported — https://creativecommons.org/licenses/by/3.0/
- **Bundled file:** `mystery-forest-alexandr-zhelanov.mp3`
- **Changes:** none to the recording; repeated during playback.

Preserve the artist's attribution and source/license notices when redistributing.
The recording is CC BY 3.0, not ShareAlike and not the application code's MIT
license. The full license, including its warranty disclaimer, is bundled at
`../licenses/cc-by-30.txt`. Visible credits are at `/credits#music`, linked
from the game's credits control.

Playback uses a local HTML audio element with looping enabled. Music starts on
the first interaction or via the mute button, at a fixed volume of 5%.
The mute preference is saved in browser storage. The player is mounted at the
app root so page navigation does not restart playback. Starting or resuming tunes
to `(Date.now() / 1000) % trackDuration`, giving the track a shared radio-style
position rather than starting at the beginning.

## Page controls

The root player is mounted once in `app.vue`, outside `NuxtPage` and layouts.
Internal routes use Nuxt navigation, including the credits page and sign-out.
Pages and dialogs can control the same player:

```ts
const music = useBackgroundMusic();

music.pause();  // Temporary pause; keeps the playback position.
music.resume(); // Resumes unless the user muted music.
music.mute();   // Remembers the user preference.
music.unmute();
```

`play` is an alias of `resume`. Read-only `isPlaying`, `isMuted`, `isPaused`,
and `hasError` refs are available. Playback still needs a browser-authorized user
interaction. Hard reloads and leaving the application create a new document;
normal in-app navigation does not recreate or restart the audio element.
