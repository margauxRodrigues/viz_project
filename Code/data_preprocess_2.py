import pandas as pd
import json

dataset = pd.read_csv("data/df_fr.csv", decimal = '.')
dataset = dataset.loc[:,['age', 'sex', 'icd10', 'geo', '2015', '2014']]
dataset = dataset[dataset['age'] == 'TOTAL']
colnames = ['id', 'parentId', '2015', '2014']
new_df = pd.DataFrame(columns = colnames)
dataset['2015'] = dataset['2015'].str.replace(':','0')
dataset['2014'] = dataset['2014'].str.replace(':','0')
dataset['2014'] = dataset['2014'].str.replace(' ','')
dataset['2015'] = dataset['2015'].str.replace(' ','')
dataset['2015'] = dataset['2015'].astype(float)
dataset['2014'] = dataset['2014'].astype(float)

# First line
new_df.loc[0] = ['root', '','','']
i = 1
# First loop for regions
regions = dataset['geo'].unique()
for elt in regions:
    new_df.loc[i] = [elt, 'root', '', '']
    i += 1

# Loop for sexes
sexes = ['M', 'F']
for elt in regions:
    for s in sexes:
        new_df.loc[i] = [s+'_'+elt, elt, '', '']
        i += 1

# Loop for illnesses
illnesses = dataset['icd10'].unique()
for elt in regions: 
    for s in sexes:
        for ill in illnesses:
            try:
                new_df.loc[i] = [s+'_'+elt+'_'+ill, s+'_'+elt, dataset[(dataset['geo'] == elt) & (dataset['sex'] == s) & (dataset['icd10'] == ill)]['2015'].values[0], dataset[(dataset['geo'] == elt) & (dataset['sex'] == s) & (dataset['icd10'] == ill)]['2014'].values[0]]
                i += 1
            except:
                pass


new_df.to_csv('hierarchie.csv')