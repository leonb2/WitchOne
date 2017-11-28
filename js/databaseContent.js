exports.getData = function () {
    return [places, questions];
} 

const places = [
    {
        'name': "Kirche",
        'roles': [
            "Pfarrer",
            "Priester",
            "Gläubiger",
            "Bischoff",
            "Beichter",
            "Asylsuchender"
        ]
    },  
    {
        'name': "Kloster",
        'roles': [
            "Abt",
            "Mönch",
            "Schreiber",
            "Brauer",
            "Gärtner",
            "Küchenmeister",
            "Novize"
        ]
    },    
    {
        'name': "Taverne",
        'roles': [
            "Wirt",
            "Wache",
            "Soldat",
            "Säufer",
            "Ritter",
            "Schankmaid",
            "Meuchler",
            "Schausteller",
            "Küchenknabe"
        ]
    },    
    {
        'name': "Schlachtfeld",
        'roles': [
            "Fußsoldat",
            "Vasall",
            "Fahnenträger",
            "Bogenschütze",
            "Heerführer",
            "König",
            "Belagerungsspezialist",
            "Ritter",
            "Söldner",
            "Desateur",
            "Verwundeter"        
        ]
    },    
    {
        'name': "Thronsaal",
        'roles': [
            "Bittsteller",
            "Wache",
            "Bediensteter",
            "Hofnarr",
            "Mundschenk",
            "Leibwächter",
            "Berater",
            "König",
            "Ritter",
            "Thronfolger"
        ]
    },    
    {
        'name': "Stallungen",
        'roles': [
            "Knecht",
            "Reiter",
            "Ritter",
            "Stallmeister",
            "Hufschmied",
            "Sattler",
            "Riemer",
            "Wagner"
        ]
    },    
    {
        'name': "Kriegsschiff",
        'roles': [
            "Kriegsherr",
            "Krieger",
            "Meuterer",
            "Ruderer",
            "Seekranker",
            "Tunichtgut"
        ]
    },
    {
        'name': "Hafen",
        'roles': [
            "Kaufmann",
            "Händler",
            "Freibeuter",
            "Steuereintreiber",
            "Zöllner",
            "Seefahrer",
            "Reeder",
            "Fischer",
            "Seiler"
        ]
    },    
    {
        'name': "Stadttor",
        'roles': [
            "Zöllner",
            "Händler",
            "Wache",
            "Bettler",
            "Reisender",
            "Schausteller"
        ]
    },    
    {
        'name': "Zinsgut",
        'roles': [
            "Bauer",
            "Händler",
            "Magd",
            "Lehnsherr",
            "Knecht",
            "Sohn",
            "Tochter"
        ]
    },
    {
        'name': "Schmiede",
        'roles': [
            "Schmied",
            "Geselle",
            "Knabe",
            "Ritter",
            "Soldat",
            "Söldner",
            "Schwertfeger",
            "Messerschmied",
            "Nagelschmied",
            "Zirkelschmied",
            "Wagner"
        ]
    },    
    {
        'name': "Kaserne",
        'roles': [
            "Soldat",
            "Rekrut",
            "Ausbilder",
            "Rüstmeister",
            "Schwertfeger"
        ]
    },    
    {
        'name': "Marktplatz",
        'roles': [
            "Händler",
            "Schmied",
            "Herold",
            "Bettler",
            "Taschendieb",
            "Hehler",
            "Marktschreier",
            "Wache",
            "Metzger",
            "Schneider",
            "Töpfer",
            "Schausteller",
            "Müller"
        ]
    },    
    {
        'name': "Lazarett",
        'roles': [
            "Medicus",
            "Verletzter",
            "Quacksalber",
            "Geistiger",
            "Gehilfe"
        ]
    },      
    {
        'name': "Siechenhaus",
        'roles': [
            "Kranker",
            "Bader",
            "Verletzter",
            "Gehilfe",
            "Geistiger",
            "Findelkind"
        ]
    },      {
        'name': "Hofküche",
        'roles': [
            "Küchenmeister",
            "Wasserholer",
            "Feuermacher",
            "Bratspieﬂdreher",
            "Küchenknabe"
        ]
    }
]

const questions = [
    { 'question' : "Zu welcher Tageszeit ist man hier?"},
    { 'question' : "Ist dies ein öffentlicher/privater Ort?"},
    { 'question' : "Ist es hier warm/kalt?"},
    { 'question' : "Wie ist der Altersdurchschnitt hier?"},
    { 'question' : "Sind hier viele Menschen?"},
    { 'question' : "Bist du freiwillig/beruflich hier?"},
    { 'question' : "Welche Farben kommen hier vor?"},
    { 'question' : "Gibt es hier Essen?"},
    { 'question' : "Wie ist das Essen hier?"},
    { 'question' : "Ist dieser Ort fest an einem Ort?"},
    { 'question' : "Wie ist der Geruch hier?"},
    { 'question' : "Riecht es hier un- angenehm?"},
    { 'question' : "Riecht es hier un- angenehm?"},
    { 'question' : "Wie laut ist es hier im Durchschnitt?"},
    { 'question' : "Wie ist die Stimmung hier?"},
    { 'question' : "Herrscht hier gute Stimmung?"}
]