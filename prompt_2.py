import sys
import requests
import json

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

city_list = sys.argv[1:]

url = "https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search"

locale = "es-ES"
#locale = "en-GB"
url_entityId = f"https://partners.api.skyscanner.net/apiservices/v3/geo/hierarchy/flights/{locale}"

api_key = "sh969210162413250384813708759185"

headers = {
    "x-api-key": api_key,
    "Content-Type": "application/json"
}


response_entityId = requests.get(url_entityId, headers=headers)
data = response_entityId.json()

#print(data)

cities = {}

for city in data['places'].values():
    cities[city['name']] = [city['iata'], city['entityId']]

#print(cities)

def search_city_entityId(city_name):
    result = []
    for name,info in cities.items():
        if city_name.lower() in name.lower():
            result.append(info[1])
    return result

#print(search_city_entityId('tenerife'))

def get_query(origin_entityId,dest_entityId):
    data = {
        "query": {
            "market": "ES",
            "locale": "es-ES",
            "currency": "EUR",
            "queryLegs": [
                {
                    "originPlace": {
                        "queryPlace": {
                            "entityId": origin_entityId
                        }
                    },
                    "destinationPlace": {
                        "queryPlace": {
                            "entityId": dest_entityId
                        }
                    },
                    "anytime": True
                }
            ]
        }
    }
    return data

data = get_query(search_city_entityId("Barcelona")[0],search_city_entityId("London")[0])
#print(data)

response = requests.post(url, headers=headers, json=data)
# print(response.status_code)
#print(dir(response))
data = response.json()

def get_min_price(data):
    quotes = data["content"]["results"]["quotes"]
    precios = [float(quote["minPrice"]["amount"]) for quote in quotes.values()]
    return min(precios)

print("MinPrice is: ", get_min_price(data))




def get_av_price(city_list,destination):
    entityId_dest = search_city_entityId(destination)
    result = []
    for city in city_list:
        min_prices_city = []
        entityId_city = search_city_entityId(city)
        for dest in entityId_dest:
            for origin in entityId_city:
                data = get_query(origin,dest)
                response = requests.post(url, headers=headers, json=data)
                data = response.json()
                min_prices_city.append(get_min_price(data))
        result.append(sum(min_prices_city) / len(min_prices_city))
    return sum(result) / len(result)

print("Precio medio del destino: ", get_av_price(["Barcelona","Madrid","Tenerife"],"Valencia"))




# quotes = data["content"]["results"]["quotes"]
# carriers = data["content"]["results"]["carriers"]
# places = data["content"]["results"]["places"]


# for quote_id, quote_info in quotes.items():
#     price = quote_info["minPrice"]["amount"]
#     is_direct = quote_info["isDirect"]
    
#     carrier_id = quote_info["outboundLeg"]["marketingCarrierId"]
#     carrier_name = carriers[carrier_id]["name"] if carrier_id in carriers else "Desconocida"
    
#     date_info = quote_info["outboundLeg"]["departureDateTime"]
#     fecha = f"{date_info['year']}-{date_info['month']:02d}-{date_info['day']:02d}"

#     print(f"   Vuelo con {carrier_name}")
#     print(f"   Fecha: {fecha}")
#     print(f"   Precio: {price} Eur")
#     print(f"   Directo: {'Sí' if is_direct else 'No'}\n")

