const fs = require('fs');

// Read the Wortschatz A1 file
const wortschatzPath = '.curriculum-analysis/books/netzwerk-neu-a1-b1/wortschatz-a1.txt';
const content = fs.readFileSync(wortschatzPath, 'utf8');

// Parse vocabulary - German words followed by Indonesian translations
const lines = content.split('\n');
const vocabulary = [];
let currentChapter = '';
let currentSection = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Skip empty lines
  if (!line) continue;
  
  // Check for chapter headers
  if (line.startsWith('KAPITEL')) {
    currentChapter = line;
    continue;
  }
  
  // Check for section headers
  if (line === 'NOMEN' || line === 'VERBEN' || line === 'ADJEKTIVE' || line === 'ADVERBIEN' || line === 'PRÄPOSITIONEN' || line === 'KONJUNKTIONEN' || line === 'SONSTIGES') {
    currentSection = line;
    continue;
  }
  
  // Check if this is a German word (starts with article or capital letter)
  const isGermanWord = /^(der|die|das|ein|eine|kein|keine|[A-ZÄÖÜ][a-zäöüß]+|sich |nicht |noch |schon |bitte |danke |hallo |tschüss |guten |gute |guter |gutes)/.test(line);
  
  // Check if this is an Indonesian translation (starts with lowercase or common Indonesian words)
  const isIndonesianTranslation = /^(nama|alamat|nomor|kota|jalan|orang|wanita|pria|anak|ibu|ayah|saudara|teman|guru|dokter|polisi|karyawan|pegawai|mahasiswa|siswa|pelajar|pekerja|petani|pedagang|supir|pilot|perawat|bidan|tukang|pengrajin|penjual|pelayan|koki|pemilik|manajer|direktur|presiden|menteri|anggota|ketua|sekretaris|bendahara|komandan|jenderal|kapten|sergeant|prajurit|tentara|polisi|pemadam|paramedis|dokter|perawat|bidan|apoteker|ahli|spesialis|konsultan|pengacara|hakim|jaksa|notaris|akuntan|auditor|insinyur|arsitek|desainer|programer|web|database|jaringan|server|komputer|laptop|tablet|ponsel|telepon|fax|email|internet|website|blog|facebook|twitter|instagram|youtube|google|whatsapp|telegram|line|weixin|kakao|viber|skype|zoom|teams|meet|slack|trello|asana|jira|github|gitlab|bitbucket|npm|yarn|pip|composer|docker|kubernetes|aws|azure|gcp|firebase|supabase|mongodb|postgresql|mysql|redis|elasticsearch|kafka|rabbitmq|nginx|apache|caddy|traefik|consul|vault|terraform|ansible|jenkins|github|gitlab|circleci|travis|bamboo|teamcity|octopus|deploy|release|production|staging|development|testing|qa|uat|sandbox|demo|preview|canary|blue|green|rolling|feature|flag|toggle|switch|config|env|secret|key|token|password|credential|certificate|ssl|tls|https|http|ftp|ssh|scp|rsync|curl|wget|ping|traceroute|nslookup|dig|host|whois|nmap|netcat|socat|iptables|firewall|proxy|vpn|nat|dhcp|dns|smtp|imap|pop3|imap|smtp|exchange|outlook|gmail|yahoo|protonmail|tutanota|mailchimp|sendgrid|postmark|mailgun|ses|sqs|sns|kinesis|dynamodb|s3|ec2|lambda|cloudfront|route53|elasticbeanstalk|codedeploy|codepipeline|codebuild|ecr|ecs|fargate|eks|eks|aurora|rds|redshift|neptune|elasticache|mq|msk|kinesis|firehose|glue|athena|sagemaker|comprehend|transcribe|polly|rekognition|textract|lex|connect|workdocs|workmail|chime|ses|sqs|sns|step|functions|api|gateway|appsync|amplify|cognito|cognito|amplify|appsync|graphql|rest|soap|grpc|websocket|http|tcp|udp|ip|mac|url|uri|urn|uuid|guid|hash|md5|sha|crc32|base64|hex|binary|ascii|unicode|utf8|latin|greek|cyrillic|arabic|hebrew|chinese|japanese|korean|thai|vietnamese|hindi|bengali|tamil|telugu|kannada|malayalam|marathi|gujarati|punjabi|urdu|persian|turkish|hungarian|finnish|estonian|latvian|lithuanian|polish|czech|slovak|slovenian|croatian|serbian|bosnian|montenegrin|macedonian|bulgarian|romanian|albanian|greek|armenian|georgian|azerbaijani|kazakh|uzbek|turkmen|kyrgyz|tajik|mongolian|tibetan|burmese|khmer|lao|indonesian|malay|filipino|tagalog|cebuano|ilocano|pangasinan|waray|bicolano|kapampangan|tagalog|bisaya|ilonggo|ivatan|masbateño|romblomanon|caluyanon|onsi|bantoanon|cuyonon|tandaganon|surigaonon|butuanon|dinagat|manobo|t'boli|bagobo|mandaya|b'laan|tagabawa|kalagan|mansaka|mandaya|mangguwangan|mandar|sundanese|javanese|madurese|balinese|sasak|madurese|batak|minangkabau|acehnese|buginese|makassarese|torajan|mandar|rejang|lampung|enggano|mentawai|nias|batak|simalungun|karo|pakpak|toba|simalungun|angkola|mangkabau|padang|minangkabau|rejang|lampung|enggano|mentawai|nias|batak|simalungun|karo|pakpak|toba|simalungun|angkola|mangkabau|padang|minangkabau)/i.test(line);
  
  if (isGermanWord && !isIndonesianTranslation) {
    // This is a German word, next line should be Indonesian translation
    const germanWord = line;
    const indonesianTranslation = lines[i + 1]?.trim() || '';
    
    if (indonesianTranslation && !/^(KAPITEL|NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|SONSTIGES)/.test(indonesianTranslation)) {
      vocabulary.push({
        word: germanWord,
        translation: indonesianTranslation,
        chapter: currentChapter,
        section: currentSection
      });
      i++; // Skip the translation line
    }
  }
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
