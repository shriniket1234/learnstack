import json

with open('models.json', 'rb') as f:
    content = f.read().decode('utf-8-sig')  # utf-8-sig handles BOM
    data = json.loads(content)

free_models = []
for model in data['data']:
    pricing = model['pricing']
    if all(float(pricing.get(k, 1)) == 0 for k in ['prompt', 'completion', 'request', 'image', 'web_search', 'internal_reasoning']):
        free_models.append({
            'id': model['id'],
            'name': model['name']
        })

print(json.dumps(free_models, indent=2))
