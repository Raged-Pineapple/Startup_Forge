import requests
import json
import time
from slugify import slugify

WIKI_API = "https://en.wikipedia.org/w/api.php"
WIKIDATA_API = "https://www.wikidata.org/wiki/Special:EntityData/{}.json"
OUT = "companies.jsonl"

HEADERS = {
    "User-Agent": "StartupForgeScraper/1.0 (Academic Research; Contact: youremail@example.com)"
}

def get_wikipedia_summary(title):
    params = {
        "action": "query",
        "prop": "extracts|pageprops",
        "exintro": True,
        "explaintext": True,
        "redirects": 1,
        "titles": title,
        "format": "json"
    }
    r = requests.get(WIKI_API, params=params, headers=HEADERS)
    data = r.json()

    page = next(iter(data["query"]["pages"].values()))
    extract = page.get("extract", "")
    wikidata_id = page.get("pageprops", {}).get("wikibase_item", "")

    return extract, wikidata_id


def get_wikidata_details(wikidata_id):
    if not wikidata_id:
        return {}

    url = WIKIDATA_API.format(wikidata_id)
    r = requests.get(url, headers=HEADERS)
    data = r.json()
    entity = data["entities"][wikidata_id]

    def get_label(pid):
        if pid in entity["claims"]:
            item = entity["claims"][pid][0]["mainsnak"]["datavalue"]["value"]
            if "id" in item:
                return get_label_from_id(item["id"])
        return None

    def get_list(pid):
        names = []
        if pid in entity["claims"]:
            for x in entity["claims"][pid]:
                item = x["mainsnak"]["datavalue"]["value"]
                if "id" in item:
                    names.append(get_label_from_id(item["id"]))
        return names

    # Fetch label name
    def get_label_from_id(qid):
        url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
        d = requests.get(url).json()
        ent = d["entities"][qid]
        return ent["labels"]["en"]["value"]

    return {
        "country_of_origin": get_label("P495"),
        "headquarters": get_label("P159"),
        "industry": get_label("P452"),
        "parent_company": get_label("P749"),
        "subsidiaries": get_list("P355"),
        "competitors": get_list("P488"),  # 🔥 Direct competitor list
        "founders": get_list("P112"),
        "founded": get_label("P571")
    }


def load_fortune_companies():
    # Wikipedia Fortune Global 500 list (top 50)
    url = "https://en.wikipedia.org/wiki/Fortune_Global_500"
    html = requests.get(url, headers=HEADERS).text
    import re
    matches = re.findall(r'<td>\d+</td>\s*<td><a[^>]+>(.*?)</a>', html)
    return list(dict.fromkeys(matches))[:50]


def scrape_all():
    companies = load_fortune_companies()

    with open(OUT, "w", encoding="utf-8") as f:
        for c in companies:
            print(f"[+] Processing {c}")

            summary, wikidata_id = get_wikipedia_summary(c)
            wikidata_info = get_wikidata_details(wikidata_id)

            record = {
                "company_name": c,
                "description": summary,
                "wikidata_id": wikidata_id,
                **wikidata_info
            }

            f.write(json.dumps(record, ensure_ascii=False) + "\n")
            time.sleep(0.3)  # polite

    print("\n[✔] Completed. Output written to:", OUT)


if __name__ == "__main__":
    scrape_all()
