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
            "Bratspießdreher",
            "Küchenknabe"
        ]
    }
]

const questions = [
    { 'question' : "Zu welcher Tageszeit befindest du dich hier?"},
    { 'question' : "Ist dieser Ort öffentlich oder privat?"},
    { 'question' : "Wie hoch ist die Durchschnittstemperatur?"},
    { 'question' : "Wie hoch ist der Altersdurchschnitt?"},
    { 'question' : "Wie viele Menschen halten sich hier im Druchschnitt auf?"},
    { 'question' : "Bist du privat oder beruflich hier?"},
    { 'question' : "Welche auffälligen Farben gibt es an diesem Ort?"},
    { 'question' : "Kannst du hier Essen und Trinken erwerben?"},
    { 'question' : "Ist der gesellschaftliche Stand gehoben oder eher gering?"},
    { 'question' : "Ist dieser Ort fest oder beweglich?"},
    { 'question' : "Gibt es an diesem Ort einen auffälligen Geruch?"},
    { 'question' : "Wie ist der gesundheitliche Zustand der Menschen an diesem Ort?"},
    { 'question' : "Was für Tiere halten sich hier auf?"},
    { 'question' : "Wie hoch ist der Lautstärkepegel? Ist es eher ruhig oder laut?"},
    { 'question' : "Ist die Stimmung ausgelassen oder ernst?"},
    { 'question' : "Ist es lebensbedrohlich an diesem Ort?"}
]