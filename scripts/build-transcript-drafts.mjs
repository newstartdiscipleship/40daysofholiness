import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requestedDays = process.argv.slice(2);
if (!requestedDays.length) throw new Error('Pass one or more day slugs, for example: day01 day02');
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const titles = {
  day01: ['God Is Holy and the Source of Holiness', 'Guided Prayer: The Holiness of God'],
  day02: ['All Things Are Holy Only as They Relate to God', 'Guided Prayer: Holiness Comes From God'],
  day03: ['Sin Separates Us From Holiness', 'Guided Prayer: Confession and Cleansing'],
  day04: ['God Planned to Make Us Holy', 'Guided Prayer: Resting in God’s Plan'],
  day05: ['Jesus Is the Perfect Human Expression of Holiness', 'Guided Prayer: Becoming Like Jesus'],
  day06: ['Saved by Grace for Holiness', 'Guided Prayer: Saved From Slavery for Holiness'],
  day07: ['Holiness in the Old Testament', 'Guided Prayer: Teach Us Your Holiness'],
  day08: ['Can You Grow in Holiness?', 'Guided Prayer: Deeper Holiness'],
  day09: ['Biblical Holiness Means Separation to God', 'Guided Prayer: Everything Belongs to God'],
  day10: ['Holiness Means Purity From Corruption', 'Guided Prayer: Purify the Heart'],
  day11: ['The Sin Nature and the Human Heart', 'Guided Prayer: Create in Me a Clean Heart'],
  day12: ['The Deceitful Heart and Self-Sovereignty', 'Guided Prayer: Search and Cure My Heart'],
  day13: ['Jesus Makes Us Holy Through His Blood', 'Guided Prayer: Holiness Through Jesus'],
  day14: ['Holiness and the New Birth', 'Guided Prayer: Live as One of God’s Holy People'],
  day15: ['The Possibilities of Grace', 'Guided Prayer: See the Possibilities of Grace'],
  day16: ['Holiness Means an Undivided Heart', 'Guided Prayer: An Undivided Heart'],
  day17: ['Holiness Is the Destination of the Universe', 'Guided Prayer: The Destination of the Universe'],
  day18: ['Love God With All Your Heart', 'Guided Prayer: Loving God With All Your Heart'],
  day19: ['Freedom From Sin: A Christian Juneteenth', 'Guided Prayer: Freedom From Sin'],
  day20: ['How to Make a Full Surrender to God', 'Guided Prayer: Full Surrender'],
  day21: ['A Further Cleansing After Salvation', 'Guided Prayer: Cleanse the Heart'],
  day22: ['Be Filled With the Holy Spirit', 'Guided Prayer: Filled With the Holy Spirit'],
  day23: ['God Completes the Work Begun at New Birth', 'Guided Prayer: Complete Your Holy Work'],
  day24: ['Salvation Was, Is, and Will Be', 'Guided Prayer: God’s Complete Salvation'],
  day25: ['Entire Sanctification in 1 Thessalonians 5', 'Guided Prayer: Sanctify Us Through and Through'],
  day26: ['God Cleanses the Heart From Idols', 'Guided Prayer: Cleanse Us From Idols'],
  day27: ['Follow Holiness', 'Guided Prayer: Pursuing Holiness'],
  day28: ['Biblical Metaphors for Holiness', 'Guided Prayer: Pictures of Holiness'],
  day29: ['Surrendering the Good and Holy to God', 'Guided Prayer: Surrender Everything Holy'],
  day30: ['Holiness as Wholeness', 'Guided Prayer: Make Us Whole'],
  day31: ['Beholding God’s Glory Changes Us', 'Guided Prayer: Beholding Glory'],
  day32: ['Holiness as Spiritual Empowerment', 'Guided Prayer: Empowered for Holy Living'],
  day33: ['The Roots and Fruits of Sin', 'Guided Prayer: Holy Roots and Fruit'],
  day34: ['Holiness and the Body', 'Guided Prayer: Honor God With Your Body'],
  day35: ['Holiness and the Mind', 'Guided Prayer: Renew the Mind'],
  day36: ['Holiness and the Will', 'Guided Prayer: Surrender the Will'],
  day37: ['Holiness and the Emotions', 'Guided Prayer: Holy Emotions'],
  day38: ['How God Sanctifies Our Emotions', 'Guided Prayer: Sanctify Our Emotions'],
  day39: ['Take Up Your Cross Daily', 'Guided Prayer: Daily Cross-Bearing'],
  day40: ['The Claws of the Lion', 'Guided Prayer: Christ’s Holy Strength']
};

const introductions = {
  day06: 'We are <strong>saved by grace for holiness</strong>. God does not wait for us to become holy before he loves and rescues us; he delivers us from slavery to sin and then leads us into the holy life for which he saved us.',
  day07: '<strong>Holiness in the Old Testament</strong> is not an irrelevant collection of rules. Leviticus patiently teaches Israel what God is like, why his holiness differs from pagan counterfeits, and how his people are to reflect his character.',
  day08: '<strong>Can you grow in holiness?</strong> Exodus and Leviticus show that deeper levels of holiness are both needed and possible. God calls his people beyond spiritual stagnation into deeper fellowship, usefulness, joy, and Christlikeness.',
  day09: '<strong>Biblical holiness means separation to God</strong> from what is common or ordinary. When God claims a life, no role, possession, routine, relationship, thought, or moment remains outside his ownership.',
  day10: '<strong>Holiness means purity from corruption</strong>—not merely cleaner outward behavior, but unmixed motives and a heart free from sin’s defilement. God intends to cleanse the wound at its deepest point.',
  day11: 'The <strong>sin nature and the human heart</strong> explain why knowing what is right does not automatically make us do it. Scripture identifies a bent toward self-sovereignty that produces sinful actions and attitudes.',
  day12: 'The Bible describes a <strong>deceitful heart</strong> whose inward bend toward self-sovereignty disguises itself as self-protection, self-esteem, and even religious correctness. God exposes this hidden corruption in order to heal it.',
  day13: '<strong>Jesus makes us holy through his blood.</strong> The cross provides both a righteous standing before God and the cleansing, transforming holiness that restores what sin has broken.',
  day14: '<strong>Holiness and the new birth</strong> belong together. God justifies, adopts, and regenerates believers, giving them a new and holy life through the presence and power of the Holy Spirit.',
  day15: 'The <strong>possibilities of grace</strong> change how we hear God’s call to holiness. Grace is not only forgiveness when we fail; it is God’s enabling power to accomplish his will in us.',
  day16: '<strong>Holiness means an undivided heart</strong>—a heart united in reverence, love, and loyalty to God rather than pulled in competing directions.',
  day17: '<strong>Holiness is the destination of the universe.</strong> God’s saving purpose moves his people and ultimately creation toward the holy beauty of his character.',
  day18: '<strong>Loving God with all your heart</strong> is central to holiness. God calls for wholehearted love rather than a divided spiritual life.',
  day19: '<strong>Freedom from sin</strong> is a real part of Christian salvation. Romans 6 announces an emancipation from sin’s mastery—a spiritual Juneteenth.',
  day20: '<strong>Full surrender to God</strong> places the whole person at his disposal. Romans 12 calls believers to offer themselves as a living sacrifice.',
  day21: '<strong>Cleansing after salvation</strong> addresses corruption within the believer’s heart, not merely the guilt of past sinful acts.',
  day22: 'The command to <strong>be filled with the Holy Spirit</strong> calls believers to yield every part of life to the Spirit’s holy presence and power.',
  day23: '<strong>God completes the holy work begun at new birth.</strong> Sanctification develops in lived reality what God first gives through regeneration.',
  day24: '<strong>Salvation was, is, and will be.</strong> Scripture presents salvation as a completed rescue, a present transforming work, and a future completion.',
  day25: '<strong>Entire sanctification</strong> is Paul’s prayer that God would sanctify believers through and through—spirit, soul, and body.',
  day26: '<strong>God cleanses the heart from idols.</strong> Ezekiel 36 joins cleansing, a new heart, and the indwelling Spirit in God’s promise of holiness.',
  day27: 'Scripture commands believers to <strong>follow holiness</strong>. We pursue it actively while depending completely upon God’s grace.',
  day28: '<strong>Biblical metaphors for holiness</strong> show one divine work from several angles: cleansing, filling, surrender, crucifixion, and transformation.',
  day29: '<strong>Surrendering to God</strong> includes not only abandoning evil but placing every good gift, ability, relationship, and holy desire in his hands.',
  day30: '<strong>Holiness as wholeness</strong> means an integrated life gathered around love for God rather than a heart fragmented by competing masters.',
  day31: '<strong>Beholding God’s glory changes us.</strong> As believers look toward Christ, the Spirit transforms them increasingly into his image.',
  day32: '<strong>Holiness includes spiritual empowerment.</strong> The Holy Spirit supplies strength for obedience, witness, service, and Christlike living.',
  day33: '<strong>The roots and fruits of sin</strong> must be distinguished. God addresses the inward source so that outward life can bear holy fruit.',
  day34: '<strong>Holiness includes the body.</strong> Christian holiness embraces physical habits, appetites, sexuality, work, rest, and embodied worship.',
  day35: '<strong>Holiness includes the mind.</strong> God renews patterns of thought so believers can recognize truth and think in ways shaped by Christ.',
  day36: '<strong>Holiness includes the will.</strong> God does not erase human choice; he heals and aligns the will so that it freely desires his purposes.',
  day37: '<strong>Holiness includes the emotions.</strong> Feelings are neither ignored nor allowed to rule; they are brought under Christ’s transforming lordship.',
  day38: '<strong>God sanctifies our emotions</strong> by healing their inward sources and teaching us to feel and respond in ways consistent with holy love.',
  day39: 'Jesus calls every disciple to <strong>take up the cross daily</strong>. Holy living repeatedly chooses self-denial, obedience, and faithful love.',
  day40: '<strong>The claws of the Lion</strong> portray the strong, untamable holiness of Christ. His transforming grace is loving, powerful, and unwilling to leave us unchanged.'
};

function paragraphs(text) {
  const sentences = text.match(/[^.!?]+(?:[.!?]+[”"']?|$)/g) ?? [text];
  const groups = [];
  for (let index = 0; index < sentences.length; index += 4) groups.push(sentences.slice(index, index + 4).join(' ').replace(/\s+/g, ' ').trim());
  return groups.filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n\n');
}

const subheadings={day16:['Psalm 86 and a Heart United in God','From Double-Mindedness to Holy Love'],day17:['God’s Purpose Is Moving Toward Holiness','Live Now in Light of the Destination'],day18:['The Greatest Commandment and Holy Love','Give God Every Affection'],day19:['Romans 6 Announces Freedom From Sin','Become Who You Are in Christ'],day20:['Offer Your Body as a Living Sacrifice','The Meaning of Full Surrender'],day21:['Why Believers Need Further Cleansing','God Purifies the Inward Source'],day22:['The Command to Be Filled With the Spirit','Yield Every Room of the Heart'],day23:['New Birth Begins a Real Work','God Is Faithful to Complete His Project'],day24:['Saved From Sin’s Penalty, Power, and Presence','Trust God’s Whole Saving Work'],day25:['Sanctified Through and Through','The Faithful God Will Do It'],day26:['Ezekiel’s Promise of Cleansing','A New Heart and a New Spirit'],day27:['Pursuit and Grace Belong Together','Run After the Holiness God Gives'],day28:['One Work Described Through Many Pictures','Let Every Metaphor Illuminate the Whole'],day29:['More Than Surrendering Sin','Place Every Good Gift in God’s Hands'],day30:['A Heart Gathered Around One Center','Holy Love Makes the Person Whole'],day31:['Look to Christ and Be Transformed','The Spirit Changes What We Behold'],day32:['Power for Obedience and Service','The Holy Spirit Enables Holy Living'],day33:['Sinful Fruit Reveals a Deeper Root','Let God Transform the Source'],day34:['Your Body Belongs to the Lord','Embodied Habits of Holy Living'],day35:['The Renewal of the Mind','Bring Every Thought Under Christ'],day36:['A Will Healed and Aligned With God','Choose Obedience Through Grace'],day37:['Emotions Belong Within Holiness','Feelings Under the Lordship of Christ'],day38:['Healing the Sources of Disordered Emotion','Learning the Emotional Life of Jesus'],day39:['The Daily Meaning of the Cross','Self-Denial as Faithful Love'],day40:['The Lion Is Not Safe, but He Is Good','Strong Grace That Will Not Let Us Go']};
function articleParagraphs(text,headings=[]){const sentences=(text.match(/[^.!?]+(?:[.!?]+[”"']?|$)/g)??[text]).map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>s&&!/(?:welcome (?:back )?to 40 Days|grab (?:a hold of )?(?:your|a) workbook|40daysofholiness\s*\.\s*com|do (?:the|your) workbook|see you (?:back here )?tomorrow|thanks for being here|let's continue (?:praying|seeking)|continue (?:to pray|seeking the Lord) .*own words)/i.test(s)).map(s=>s.replace(/^(?:Now|So|All right|Okay),?\s+/i,''));const groups=[];for(let i=0;i<sentences.length;i+=4)groups.push(sentences.slice(i,i+4).join(' ').trim());const rendered=groups.filter(Boolean).map(p=>`<p>${escapeHtml(p)}</p>`);headings.forEach((h,i)=>rendered.splice(Math.round(rendered.length*(i+1)/(headings.length+1))+i,0,`<h2>${h}</h2>`));return rendered.join('\n\n')}

await mkdir(resolve(root, 'Content/articles'), { recursive: true });
for (const slug of requestedDays) {
  if (!titles[slug]) throw new Error(`Unsupported day slug: ${slug}`);
  const videoRows = (await readFile(resolve(root, 'migration/videos.csv'), 'utf8')).split(/\r?\n/).filter((line) => line.includes(`/${slug}`));
  const teachingId = videoRows.find((line) => line.includes('TEACHING'))?.match(/,"(\d+)",/)?.[1];
  const prayerId = videoRows.find((line) => line.includes('GUIDED_PRAYER'))?.match(/,"(\d+)",/)?.[1];
  if (!teachingId || !prayerId) throw new Error(`Missing classified videos for ${slug}`);
  const teaching = await readFile(resolve(root, `Content/transcripts/clean/${slug}-${teachingId}-en.txt`), 'utf8');
  const prayer = await readFile(resolve(root, `Content/transcripts/clean/${slug}-${prayerId}-en.txt`), 'utf8').catch(() => '');
  const html = `<!-- Transcript-faithful working draft. Raw VTT remains immutable in Content/transcripts/raw/. -->
<section class="teaching-article" aria-labelledby="teaching-heading">
  <p class="kicker">Teaching</p>
  <h2 id="teaching-heading">${titles[slug][0]}</h2>
  <!-- TEACHING_VIDEO -->
  ${introductions[slug]?`<p>${introductions[slug]}</p>`:''}
  ${articleParagraphs(teaching,subheadings[slug]??[])}
</section>

<section class="guided-prayer" aria-labelledby="prayer-heading">
  <p class="kicker">Guided Prayer</p>
  <h2 id="prayer-heading">${titles[slug][1]}</h2>
  <!-- PRAYER_VIDEO -->
  ${prayer?paragraphs(prayer):'<p><em>An English transcript is not currently available for this guided-prayer video. The video is preserved here for owner review.</em></p>'}
</section>`;
  await writeFile(resolve(root, `Content/articles/${slug}.html`), html, 'utf8');
  await writeFile(resolve(root, `Content/pages/${slug}.html`), html, 'utf8');
  console.log(`${slug}: created teaching-first transcript draft and guided prayer`);
}
