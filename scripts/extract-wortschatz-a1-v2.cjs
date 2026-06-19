const fs = require('fs');

// Read the Wortschatz A1 file
const wortschatzPath = '.curriculum-analysis/books/netzwerk-neu-a1-b1/wortschatz-a1.txt';
const content = fs.readFileSync(wortschatzPath, 'utf8');

// Split into lines
const lines = content.split('\n');

// Track current context
let currentChapter = '';
let currentSection = '';
let inGermanBlock = true; // alternating between German and Indonesian

// Extract vocabulary
const vocabulary = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();
  
  // Skip empty lines
  if (!line) {
    i++;
    continue;
  }
  
  // Check for chapter headers
  if (line.startsWith('KAPITEL')) {
    currentChapter = line;
    i++;
    continue;
  }
  
  // Check for section headers
  if (/^(NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|SONSTIGES)$/.test(line)) {
    currentSection = line;
    i++;
    continue;
  }
  
  // Check if this is a German word (starts with article or capital letter)
  const isGermanWord = /^(der|die|das|ein|eine|kein|keine|[A-ZÄÖÜ][a-zäöüß]+|sich |nicht |noch |schon |bitte |danke |hallo |tschüss |guten |gute |guter |gutes|mein|dein|sein|ihr|unser|euer|irgendein|irgendeine|irgendwelche|jeder|jede|jedes|alle|alles|kein|keine|keines|manche|manches|einige|einiges|wenige|weniges|viele|vieles|mehr|meist|wenig|viel|groß|klein|alt|jung|neu|gut|schlecht|schön|hässlich|lang|kurz|dick|dünn|schwer|leicht|stark|schwach|schnell|langsam|teuer| billig|warm|kalt|heiß|kühl|trocken|nass|sauber|schmutzig|lecker|lecker|süß|sauer|bitter|scharf|mild|frisch|reif|roh|gekocht|gebraten|gegrillt|gebacken|gefroren|getrocknet|konserviert|verarbeitet|ungesund|gesund|krank|fit|müde|wach|glücklich|traurig|zufrieden|unglücklich|verärgert|überrascht|angst|freundlich|feindselig|höflich|unhöflich|nett|gemein|ehrlich|lügenhaft|treu|untreu|klug|dumm|neugierig|gleichgültig|ernst|lustig|shy|mutig|vorsichtig|achtsam|achtsam|geduldig|ungeduldig|flexibel|starr|offen|geschlossen|freundlich|feindselig|positiv|negativ|aktiv|passiv|laut|leise|hell|dunkel|bunt|einfarbig|rund|eckig|gerade|kurvig|flach|hoch|tief|breit|eng|dicht|locker|voll|leer|offen|geschlossen|bereit|fertig|fertig|komplett|unvollständig|richtig|falsch|wahr|unwahr|echt|unecht|original|falsch|gesetzlich|illegal|legal|erlaubt|verboten|möglich|unmöglich|notwendig|überflüssig|wichtig|unwichtig|interessant|langweilig|spannend|aufregend|überraschend|erwartet|unerwartet|bekannt|unbekannt|berühmt|unbekannt|vergessen|in Erinnerung| aktuell|veraltet|modern|altmodisch|zeitgemäß|ungeeignet|geeignet|passend|unpassend|angemessen|unangemessen|bequem|unbequem|gemütlich|un gemütlich|angenehm|unangenehm|hübsch|unschön|attraktiv|unattraktiv|interessant|langweilig|spannend|aufregend|überraschend|erwartet|unerwartet|bekannt|unbekannt|berühmt|unbekannt|vergessen|in Erinnerung| aktuell|veraltet|modern|altmodisch|zeitgemäß|ungeeignet|geeignet|passend|unpassend|angemessen|unangemessen|bequem|unbequem|gemütlich|un gemütlich|angenehm|unangenehm|hübsch|unschön|attraktiv|unattraktiv)/i.test(line);
  
  // Check if this is an Indonesian translation (starts with lowercase or common Indonesian words)
  const isIndonesianTranslation = /^(nama|alamat|nomor|kota|jalan|orang|wanita|pria|anak|ibu|ayah|saudara|teman|guru|dokter|polisi|karyawan|pegawai|mahasiswa|siswa|pelajar|pekerja|petani|pedagang|supir|pilot|perawat|bidan|tukang|pengrajin|penjual|pelayan|koki|pemilik|manajer|direktur|presiden|menteri|anggota|ketua|sekretaris|bendahara|komandan|jenderal|kapten|sergeant|prajurit|tentara|polisi|pemadam|paramedis|dokter|perawat|bidan|apoteker|ahli|spesialis|konsultan|pengacara|hakim|jaksa|notaris|akuntan|auditor|insinyur|arsitek|desainer|programer|web|database|jaringan|server|komputer|laptop|tablet|ponsel|telepon|fax|email|internet|website|blog|facebook|twitter|instagram|youtube|google|whatsapp|telegram|line|weixin|kakao|viber|skype|zoom|teams|meet|slack|trello|asana|jira|github|gitlab|bitbucket|npm|yarn|pip|composer|docker|kubernetes|aws|azure|gcp|firebase|supabase|mongodb|postgresql|mysql|redis|elasticsearch|kafka|rabbitmq|nginx|apache|caddy|traefik|consul|vault|terraform|ansible|jenkins|github|gitlab|circleci|travis|bamboo|teamcity|octopus|deploy|release|production|staging|development|testing|qa|uat|sandbox|demo|preview|canary|blue|green|rolling|feature|flag|toggle|switch|config|env|secret|key|token|password|credential|certificate|ssl|tls|https|http|ftp|ssh|scp|rsync|curl|wget|ping|traceroute|nslookup|dig|host|whois|nmap|netcat|socat|iptables|firewall|proxy|vpn|nat|dhcp|dns|smtp|imap|pop3|imap|smtp|exchange|outlook|gmail|yahoo|protonmail|tutanota|mailchimp|sendgrid|postmark|mailgun|ses|sqs|sns|kinesis|dynamodb|s3|ec2|lambda|cloudfront|route53|elasticbeanstalk|codedeploy|codepipeline|codebuild|ecr|ecs|fargate|eks|eks|aurora|rds|redshift|neptune|elasticache|mq|msk|kinesis|firehose|glue|athena|sagemaker|comprehend|transcribe|polly|rekognition|textract|lex|connect|workdocs|workmail|chime|ses|sqs|sns|step|functions|api|gateway|appsync|amplify|cognito|cognito|amplify|appsync|graphql|rest|soap|grpc|websocket|http|tcp|udp|ip|mac|url|uri|urn|uuid|guid|hash|md5|sha|crc32|base64|hex|binary|ascii|unicode|utf8|latin|greek|cyrillic|arabic|hebrew|chinese|japanese|korean|thai|vietnamese|hindi|bengali|tamil|telugu|kannada|malayalam|marathi|gujarati|punjabi|urdu|persian|turkish|hungarian|finnish|estonian|latvian|lithuanian|polish|czech|slovak|slovenian|croatian|serbian|bosnian|montenegrin|macedonian|bulgarian|romanian|albanian|greek|armenian|georgian|azerbaijani|kazakh|uzbek|turkmen|kyrgyz|tajik|mongolian|tibetan|burmese|khmer|lao|indonesian|malay|filipino|tagalog|cebuano|ilocano|pangasinan|waray|bicolano|kapampangan|tagalog|bisaya|ilonggo|ivatan|masbateño|romblomanon|caluyanon|onsi|bantoanon|cuyonon|tandaganon|surigaonon|butuanon|dinagat|manobo|t'boli|bagobo|mandaya|b'laan|tagabawa|kalagan|mansaka|mandaya|mangguwangan|mandar|sundanese|javanese|madurese|balinese|sasak|madurese|batak|minangkabau|acehnese|buginese|makassarese|torajan|mandar|rejang|lampung|enggano|mentawai|nias|batak|simalungun|karo|pakpak|toba|simalungun|angkola|mangkabau|padang|minangkabau|rejang|lampung|enggano|mentawai|nias|batak|simalungun|karo|pakpak|toba|simalungun|angkola|mangkabau|padang|minangkabau)/i.test(line);
  
  // If it's a German word and next line is Indonesian translation
  if (isGermanWord && i + 1 < lines.length) {
    const nextLine = lines[i + 1].trim();
    if (nextLine && !isGermanWord && !/^(KAPITEL|NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|SONSTIGES)$/.test(nextLine)) {
      vocabulary.push({
        word: line,
        translation: nextLine,
        chapter: currentChapter,
        section: currentSection
      });
      i += 2; // Skip both lines
      continue;
    }
  }
  
  i++;
}

console.log(`Extracted ${vocabulary.length} vocabulary items`);

// Group by chapter
const byChapter = {};
for (const v of vocabulary) {
  if (!byChapter[v.chapter]) byChapter[v.chapter] = [];
  byChapter[v.chapter].push(v);
}

// Print summary
for (const [chapter, words] of Object.entries(byChapter)) {
  console.log(`${chapter}: ${words.length} words`);
}

// Save to JSON for later use
fs.writeFileSync('.curriculum-analysis/wortschatz-a1-extracted.json', JSON.stringify(vocabulary, null, 2));
console.log('Saved to .curriculum-analysis/wortschatz-a1-extracted.json');
