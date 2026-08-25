import { readFile, writeFile } from 'node:fs/promises';

const days=Array.from({length:10},(_,i)=>`day${String(i+6).padStart(2,'0')}`);
const headings={
day06:[['God saved his people from slavery','<h2>Grace Comes Before Holiness</h2>'],['So the first thing that I have to ask','<h2>Saved by Grace, Created for Good Works</h2>'],['Now, don\'t miss this. Holiness is part','<h2>Holiness Is Part of the Gospel</h2>']],
day07:[['Now, when Israel left Egypt','<h2>Counterfeit Holiness in the Ancient World</h2>'],['The giving of the law in the Old Testament','<h2>God’s Commands Flow From His Character</h2>'],['And I think we need to stop here','<h2>Let God Teach You What Holiness Means</h2>']],
day08:[['First of all, circle number one','<h2>Degrees of Holiness in Leviticus</h2>'],['And this whole same diagram','<h2>Holy People, Priests, Places, and Offerings</h2>'],['Now, for just a moment, let\'s pause','<h2>Keep Growing Deeper With God</h2>']],
day09:[['In Leviticus 10:10','<h2>The Holy and the Common in Leviticus 10:10</h2>'],['Now, this teaches us a very valuable insight','<h2>A New Status Produces a New Life</h2>'],['Everything you are, everything you do','<h2>Nothing in a Holy Life Is Merely Common</h2>']],
day10:[['Yin and yang does not adequately','<h2>God Is Completely Unmixed</h2>'],['But the corruption of sin goes deeper','<h2>Corruption Reaches Our Motives</h2>'],['Now David talks about it this way','<h2>The Heart Needs Deep Cleansing</h2>']],
day11:[['If you\'ve ever had car problems','<h2>Diagnosing the Real Problem</h2>'],['Now, here\'s the thing. This sinful nature','<h2>Sinful Actions Flow From a Sinful Nature</h2>'],['Isaiah talks about it as self-sovereignty','<h2>Self-Sovereignty: The Heart of the Problem</h2>']],
day12:[['Jeremiah 17:9 says','<h2>The Heart Is Deceitful Above All Things</h2>'],['Now, salvation is powerful','<h2>Salvation and the Remaining Sin Nature</h2>'],['Self-rights, focusing on','<h2>The Many Disguises of Self</h2>'],['So what is God going to do','<h2>God Can Cure the Incurable Heart</h2>']],
day13:[['Hebrews 13:12 says','<h2>Holiness Provided at the Cross</h2>'],['But does God only provide judicial holiness','<h2>Justification and Transforming Cleansing</h2>'],['He provides holiness on the cross','<h2>God Creates What He Has Declared</h2>']],
day14:[['There\'s three ways in which sin','<h2>Three Ways God Repairs What Sin Broke</h2>'],['And God deals with that reality','<h2>Regeneration Gives New Spiritual Life</h2>'],['Specifically in Hebrews 13','<h2>Saints: God’s Holy People</h2>'],['But if you remember, holiness is not a static','<h2>Move With the Spirit’s Holy Work</h2>']],
day15:[['So how many Christians have the Holy Spirit','<h2>Every Christian Has the Holy Spirit</h2>'],['I have a pair of tinted glasses','<h2>Deprivation Glasses and Possibility Glasses</h2>'],['The deprivation hermeneutic leaves out','<h2>Grace Is God’s Enabling Power</h2>'],['If you interpret the commands of God','<h2>God Enables What He Commands</h2>']]
};
const refs={
'Ephesians 2:8-9':'Ephesians+2%3A8-9','Ephesians 2:10':'Ephesians+2%3A10','Leviticus 10:10':'Leviticus+10%3A10','Isaiah 59:2':'Isaiah+59%3A2','Ezekiel 14:4':'Ezekiel+14%3A4','Psalm 51:5':'Psalm+51%3A5','Psalm 58:3':'Psalm+58%3A3','Isaiah 53:6':'Isaiah+53%3A6','Jeremiah 17:9':'Jeremiah+17%3A9','Hebrews 13:12':'Hebrews+13%3A12','2 Corinthians 5:21':'2+Corinthians+5%3A21','Ephesians 5:25':'Ephesians+5%3A25','Hebrews 12:14':'Hebrews+12%3A14','John 8:44':'John+8%3A44','Romans 8:9':'Romans+8%3A9','1 Corinthians 15:10':'1+Corinthians+15%3A10'};
const leads={
day06:["<p>This is God's main point",'<p>A common lie says, “I must become holy and get my act together before God will want, love, and save me.” That reverses the gospel. Holiness is God’s purpose for us, but his gracious rescue comes first.</p>'],
day07:['<p>Now, people usually',''],day08:['<p>Leviticus has',''],day09:["<p>Today, we're going",''],day10:["<p>It's like this universal",''],
day11:["<p>Yeah, I know",'<p>Imagine being told to solve a math problem without being shown the problem. You could not solve it because you would not know what needed solving. The same is true in the spiritual life.</p>'],
day12:['<p>I imagine',''],day13:['<p>God provided holiness',''],day14:['<p>Holiness is gifted',''],
day15:["<p>So God gifts",'<p><a href="https://www.biblegateway.com/passage/?search=Romans+8%3A9" rel="noopener">Romans 8:9</a> teaches that anyone who does not have the Spirit of Christ does not belong to Christ.</p>']
};
for(const day of days){for(const dir of ['Content/pages','Content/articles']){const path=`${dir}/${day}.html`;let html=await readFile(path,'utf8');
  html=html.replaceAll('â€”','—').replaceAll('â€™','’').replaceAll('Darryl','Darrell');
  html=html.replace(/\s*(?:All right|Okay|Right)\?/g,'').replace(/\s*You see it\?/g,'').replace(/\s*Okay\./g,'.');
  html=html.replace(/<p>Hey,?\s+[\s\S]*?<\/p>\s*/,'').replace(/<p>com and (?:grab|get)[\s\S]*?today[^.]*\.<\/p>\s*/,'');
  html=html.replace(/<p>(?:Do your workbook|Make sure you do your workbook|Today, meditate|So take time today)[\s\S]*?<\/p>\s*/g,'').replace(/<p>[^<]*(?:I\'ll see you tomorrow|See you tomorrow)[\s\S]*?<\/p>\s*/g,'');
  html=html.replace(/Let\'s continue (?:seeking|to pray|praying)[\s\S]*?(?:words|together)\.?/g,'');
  if(day==='day11')html=html.replace(/<p>Here\'s what it says,[\s\S]*?<\/p>\s*<p>[\s\S]*?cowboy in me\.&quot;<\/p>/,'<p>In Tim McGraw’s “The Cowboy in Me,” the narrator recognizes restless pride, a hard heart, dissatisfaction, and the painful sense of being his own worst enemy. The song calls that inward pattern “the cowboy in me”—a memorable picture of the sin nature.</p>');
  if(day==='day12')html=html.replace(/<p>John Mayer wrote a song called &quot;Gravity\.&quot;[\s\S]*?bring me to my knees\.&quot;<\/p>/,'<p>John Mayer’s “Gravity” describes an inward pull that works against him: even with love available, he feels drawn toward throwing it away, wanting more, and being brought to his knees. He calls it gravity; this teaching identifies that downward pull as the sin nature.</p>');
  if(day==='day13')html=html.replace(/<p>God provided holiness in Jesus on the cross\.[\s\S]*?<p>All of this\.[\s\S]*?2,000 years ago\.<\/p>/,'<p>John Mayer’s “In the Blood” wrestles with inherited patterns, family influence, jealousy, and the fear that he may never rise above what is within him. The repeated question is whether this inward brokenness can ever be washed away. The gospel answers that we need better blood: the blood of Jesus, shed two thousand years ago.</p>');
  const video=html.indexOf('<!-- TEACHING_VIDEO -->');const introEnd=html.indexOf('</p>',video)+4;const [startMarker,replacement]=leads[day];const start=html.indexOf(startMarker,introEnd);if(start>=0)html=html.slice(0,introEnd)+'\n  '+replacement+(replacement?'\n':'')+html.slice(start);
  if(day==='day15')html=html.replace('1 Corinthians 10:15','1 Corinthians 15:10');
  for(const [marker,heading] of headings[day]){const i=html.indexOf(marker);if(i>=0){const p=html.lastIndexOf('<p>',i);html=html.slice(0,p)+heading+'\n'+html.slice(p)}}
  for(const [label,query] of Object.entries(refs))html=html.replaceAll(label,`<a href="https://www.biblegateway.com/passage/?search=${query}" rel="noopener">${label}</a>`);
  await writeFile(path,html,'utf8');}}
