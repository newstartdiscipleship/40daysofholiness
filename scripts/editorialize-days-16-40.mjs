import { readFile, writeFile } from 'node:fs/promises';

const requestedDays = process.argv.slice(2);
const days = requestedDays.length ? requestedDays : Array.from({ length: 25 }, (_, index) => `day${index + 16}`);

for (const day of days) {
  for (const directory of ['Content/pages', 'Content/articles']) {
    const path = `${directory}/${day}.html`;
    let html = await readFile(path, 'utf8');
    html = html.replaceAll('Ã¢â‚¬â€', '—').replaceAll('Ã¢â‚¬â„¢', '’').replaceAll('Darryl', 'Darrell')
      .replace(/\s*(?:All right|Okay|Right)\?/g, '').replace(/\s*You see\?/g, '');

    if (day === 'day19') html = html.replace(
      /becoming who you are, like in the great stories,[\s\S]*?It's a call to become who you really are\./,
      'J. R. R. Tolkien’s Aragorn offers another picture of becoming who one truly is: what appeared broken is renewed, and the crownless king rises into his calling.',
    );
    if (day === 'day38') html = html.replace(
      /Let me use a song[\s\S]*?allowing that imagination to create the right feelings in us\./,
      'An old hymn about feeling ready to travel toward heaven once struck me as inadequate because faithful obedience must continue even when feelings lag behind. Later I noticed that the hymn first directs the imagination toward the brightness, freedom from pain and death, beauty, and promised home of heaven. Those truths, vividly contemplated, cultivate fitting desire. The hymn illustrates how objective truth can pass through a holy imagination and produce rightly ordered emotion.',
    ).replace(/these facts, if you process &quot;My heavenly home[\s\S]*?glory of it\./, 'When these truths are contemplated carefully—when we imagine heaven’s beauty, excellence, and glory—they begin to shape our feelings.');
    if (day === 'day40') {
      html = html.replace(
        /I want to close with this story from C\. S\.[\s\S]*?began to feel deliciously cool\.(?:&quot;)?/,
        'Lewis tells how Eustace unwillingly enters Narnia and sails toward the edge of its world. Avoiding work and companionship on an island, he discovers a dragon’s treasure hoard. Because he has not read the right kinds of stories, he does not understand the danger. He falls asleep while entertaining greedy, dragon-like thoughts and awakens physically transformed into a dragon. Frightened and ashamed, he tries unsuccessfully to repair himself. One night, weeping hot tears, Eustace sees Aslan and knows he must follow. The Lion leads him up a mountain to a pool. Seeing his reflection makes Eustace weep again, but he understands that he must enter the water. First he tries to remove his dragon skin himself. One layer peels away and brings relief, but another remains beneath it. He repeats the effort and discovers still more layers. At last Eustace accepts Aslan’s help. He lies down, and the Lion drives his claws deeply into the dragon skin, tearing away what Eustace could never remove by himself. The process reaches toward his very heart and hurts intensely. Aslan then casts him into the pool; after an initial sting, the water becomes wonderfully cool. Eustace emerges freed from the dragon form.',
      );
      html = html.replace(
        /the scripture does say,[\s\S]*?clean hands and a pure heart\.(?:&quot;)?/,
        '<a href="https://www.biblegateway.com/passage/?search=Psalm+24%3A3-4" rel="noopener">Psalm 24:3–4</a> asks who may ascend the Lord’s hill and answers: the person with clean hands and a pure heart.',
      );
    }

    html = html.replace(
      /\b((?:[123]\s+)?(?:Genesis|Exodus|Leviticus|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Isaiah|Jeremiah|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?)\b/g,
      match => `<a href="https://www.biblegateway.com/passage/?search=${encodeURIComponent(match).replaceAll('%20', '+')}" rel="noopener">${match}</a>`,
    );
    html = html.replace(/<a href="[^"]+" rel="noopener"><a href="([^"]+)" rel="noopener">([^<]+)<\/a><\/a>/g, '<a href="$1" rel="noopener">$2</a>');
    await writeFile(path, html, 'utf8');
  }
}
