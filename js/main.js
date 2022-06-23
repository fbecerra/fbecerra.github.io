const projects = [
    {
        "dir": "projects/giving-dashboard/",
        "img_format": "png",
        "img_alt": "Dashboard that shows trends for donations in the United States.",
        "tags": [
            "d3.js",
            "dataviz"
        ],
        "title": "Giving Dashboard",
        "description": "A snapshot of the many ways Americans give"
    },
    {
        "dir": "projects/leaky-pipeline-advanced-placement-testing/",
        "img_format": "png",
        "img_alt": "Interactive visualization to explore gaps between AP classes enrollment and AP test taking in Florida.",
        "tags": [
            "d3.js",
            "interactive",
            "dataviz"
        ],
        "title": "Leaky Pipeline of Advanced Placement Testing",
        "description": "The gap between AP class enrollment and AP test taking"
    },
    {
        "dir": "projects/beyond-education-outcomes/",
        "img_format": "png",
        "img_alt": "Interactive visualization to explore gaps in educational resources for students from different racial and ethnic backgrounds.",
        "tags": [
            "d3.js",
            "interactive",
            "dataviz"
        ],
        "title": "Beyond Education Outcomes",
        "description": "How equitably distributed are educational resources?"
    },
    {
        "dir": "projects/give-people-paid-holidays/",
        "img_format": "png",
        "img_alt": "Interactive essay showing that holidays have been more efficient than lockdowns in keeping people at home.",
        "tags": [
            "d3.js",
            "interactive",
            "essay"
        ],
        "title": "Give people paid holidays",
        "description": "What is more efficient at keeping people at home?"
    },
    {
        "dir": "projects/covid19-toll-chile/",
        "img_format": "png",
        "img_alt": "Interactive visualizaiton to explore COVID-19 cases and deaths in Chile.",
        "tags": [
            "d3.js",
            "interactive",
            "dataviz"
        ],
        "title": "The COVID-19 toll in Chile",
        "description": "Visualizing Chile's COVID-19 cases and deaths"
    },
    {
        "dir": "projects/single-cell-analysis-sequencing/",
        "img_format": "jpg",
        "img_alt": "Interactive visualization to explore the Gen Expression Omnibus dataset and the relation between those genes.",
        "tags": [
            "d3.js",
            "interactive"
        ],
        "title": "Single cell analysis and sequencing",
        "description": "Navigating through the Gen Expression Omnibus dataset"
    },
    {
        "dir": "projects/paper-citations-authors-collaborations/",
        "img_format": "png",
        "img_alt": "Interactive network visualization showing citations between papers and collaborations between authors.",
        "tags": [
            "d3.js",
            "interactive"
        ],
        "title": "Paper citations, authors collaborations",
        "description": "Visualizing collaborative networks in academia"
    },
    {
        "dir": "projects/hattori-plots/",
        "img_format": "png",
        "img_alt": "Static plots showing relationship between fat and fat-free mass for a cohort of Chilean kids.",
        "tags": [
            "python",
            "data science",
            "dataviz"
        ],
        "title": "Hattori plots",
        "description": "Studying fatty liver desease in Chilean populations"
    },
    {
        "dir": "projects/joy-of-parsing/",
        "img_format": "jpg",
        "img_alt": "Interactive visualization to explore Bob Ross paintings and how they cluster together based on the transcripts of the show The Joy of Painting.",
        "tags": [
            "d3.js",
            "python",
            "data science"
        ],
        "title": "The joy of parsing",
        "description": "Visualizing Bob Ross's paintings"
    },
    {
        "dir": "projects/formation-first-black-holes/",
        "img_format": "png",
        "img_alt": "Scientific research studying the formation of supermassive black hole seeds in the early Universe.",
        "tags": [
            "python",
            "astronomy",
            "research"
        ],
        "title": "Formation of the first black holes",
        "description": "Simulating the creation of early black holes in the Universe"
    },
    {
        "dir": "projects/la-county-covid19-watch/",
        "img_format": "png",
        "img_alt": "Interactive visualizaiton to show the evolution of COVID-19 cases for the LA County Department of Public Health.",
        "tags": [
            "d3.js",
            "data visualization"
        ],
        "title": "LA County's COVID-19 Watch",
        "description": "Tracking LA Country's COVID-19 statistics"
    },
    {
        "dir": "projects/astrollytelling/",
        "img_format": "png",
        "img_alt": "Project to teach astronomy concepts through interactive visualizations and essays.",
        "tags": [
            "d3.js",
            "interactive",
            "storytelling"
        ],
        "title": "Astrollytelling",
        "description": "Teaching astronomy through interactive visualizations"
    },
    {
        "dir": "projects/plebiscite-new-constitution/",
        "img_format": "png",
        "img_alt": "Interactive visualization showing the timeline of the bills introduced to change the Chilean constitution.",
        "tags": [
            "d3.js",
            "interactive"
        ],
        "title": "Changing the constitution",
        "description": "Exploring bills introduced to reform the Chilean Constitution"
    }
];

const logos = [
    {
        "src": "projects/propublica/img/logo.png",
        "alt": "ProPublica logo"
    },
    {
        "src": "projects/beyond-education-outcomes/img/logo.png",
        "alt": "Urban Institute logo"
    },
    {
        "src": "projects/planet/img/logo.png",
        "alt": "Planet Labs logo"
    },
    {
        "src": "projects/hattori-plots/img/logo.png",
        "alt": "Pontifical Catholic University of Chile logo"
    },
    {
        "src": "projects/emteq/img/logo.png",
        "alt": "Emteq Labs logo"
    },
    {
        "src": "projects/gsa/img/logo.png",
        "alt": "Golden Set Analytics logo"
    },
    {
        "src": "projects/la-county-covid19-watch/img/logo.png",
        "alt": "LA County Department of Public Health logo"
    },
    {
        "src": "projects/atomics/img/logo.png",
        "alt": "Copenhagen Atomics logo"
    },
    {
        "src": "projects/paper-citations-authors-collaborations/img/logo.png",
        "alt": "Research Rabbit App logo"
    },
    {
        "src": "projects/single-cell-analysis-sequencing/img/logo.png",
        "alt": "Needle Genomics logo"
    }
]

const wrapper = d3.select("#project-gallery");

const itemCol = wrapper.selectAll(".grid-item")
    .data(projects)
    .join("div")
        .attr("class", "col-lg-4 col-md-4 grid-item mb-4");

const item = itemCol.selectAll(".listing-item")
    .data(d => [d])
    .join("div")
        .attr("class", "listing-item")

const divImage = item.append("div")
    .attr("class", "position-relative");

const linkImage = divImage.append("a")
    .attr("class", "reset-anchor d-block listing-img-holder")
    .attr("href", d => d.dir);

linkImage.append("img")
    .attr("class", "img-fluid")
    .attr("src", d => d.dir + "/img/thumbnail." + d.img_format)
    .attr("alt", d => d.img_alt);

const linkP = linkImage.append("p")
    .attr("class", "mb-0 text-primary small d-flex align-items-center listing-btn");

linkP.append("span")
    .html("Read more");
linkP.append("svg")
    .attr("class", "svg-icon text-primary svg-icon-sm ml-2")
    .append("use")
    .attr("xlink:href", "#arrow-right-1");

const divTags = item.append("div")
    .attr("class", "position-relative pt-2");

const listTags = divTags.append("ul")
    .attr("class", "list-inline listing-tags m-0")

listTags.selectAll("li")
    .data(d => d.tags)
    .join("li")
        .attr("class", "list-inline-item reset-anchor font-weight-normal text-small")
        .html(d => d);

const divTitle = item.append("div")
    .attr("class", "pt-0 pb-2");

divTitle.append("a")
    .attr("class", "reset-anchor")
    .attr("href", d => d.dir)
    .append("h1")
    .attr("class", "h5 listing-item-heading")
    .html(d => d.title);

divTitle.append("h2")
    .attr("class", "text-small mb-0 listing-item-description")
    .html(d => d.description);

const logosDiv = d3.select("#client-logos");

const logoItem = logosDiv.selectAll(".grid-item")
    .data(logos)
    .join("div")
        .attr("class", "col-lg-3 col-md-3 grid-item mb-4");

logoItem.append("div")
    .attr("class", "listing-item")
    .append("div")
    .attr("class", "position-relative")
    .append("img")
        .attr("class", "img-fluid img-logo")
        .attr("src", d => d.src)
        .attr("alt", d => d.alt);
