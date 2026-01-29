<template>
    <!-- <div class="title-container">
        <img src="../../public/images/logo_large.png" alt="Optic View" style="width: 10rem;"/>
    </div>
    <div class="container">
        <h1>Optic View</h1>
    </div> -->

    <Panel class="container">
    <template #header>
        <div class="flex items-center gap-2 cursor-pointer" @click="emit('backHome')">
            <img src="../../public/images/logo_large.png" alt="Optic View" style="width: 10rem; margin-left: 5rem; margin-top: 1rem;"/>
        </div>
    </template>
    <div style="margin: 1rem;">
        <Splitter style="height: calc(100vh - 12rem);">
        <SplitterPanel :minSize="40" :size="40" class="flex flex-col p-0">
            <div class="w-full flex items-center justify-evenly p-3 border-b surface-border">
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="num_patients_check" :disabled="!hr_check && !ae_check"/>
                <label class="font-medium"># patients</label>
            </div>
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="hr_check" :disabled="!num_patients_check && !ae_check"/>
                <label class="font-medium">HR (95% CI)</label>
            </div>
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="ae_check" :disabled="!num_patients_check && !hr_check"/>
                <label class="font-medium">AE rate (p-values)</label>
            </div>
            </div>
            <div class="flex-1 overflow-auto p-3" v-if="trial_data">
                <div v-for="item in trial_data" :key="item.trial_name" 
                 class="mb-4 p-2 rounded-lg transition-all duration-200"
                 :class="selected_trial === item ? 'bg-blue-50 ring-2 ring-[#2c6693]' : 'ring-1 ring-gray-300'">
                    <Panel class="!border-none !bg-transparent">
                        <template #header>
                            <div class="header-container cursor-pointer hover:bg-[#d2e4f0] transition-colors" @click="toggleDetails(item)">
                                <span class="font-bold text-xl">{{ item.trial_name }}</span>
                            </div>
                        </template>
                        <DataTable :value="item.macro_data" size="small" class="text-sm blue-striped-table" :rowHover="false">
                            <Column field="method_name" header="">
                                <template #body="slotProps">
                                    <span v-if="slotProps.data.method_name === 'original'" class="font-bold text-900">Original TTE</span>
                                    <span v-else class="font-bold text-900">{{slotProps.data.method_name}}</span>
                                </template>
                            </Column>
                            <Column field="num_criteria" header="# criteria" v-if="num_patients_check"></Column>
                            <Column field="num_patients" header="" v-if="num_patients_check">
                                <template #header>
                                    <div class="flex items-center gap-2">
                                        <span># patients</span>
                                        <i class="pi pi-info-circle text-white cursor-pointer" v-tooltip.top="'Number of patients'"></i>
                                    </div>
                                </template>
                            </Column>
                            <Column field="hr_ci" header="" v-if="hr_check">
                                <template #header>
                                    <div class="flex items-center gap-2">
                                        <span>HR (95% CI)</span>
                                        <i class="pi pi-info-circle text-white cursor-pointer" v-tooltip.top="'Hazard ratio (95% confidence interval)'"></i>
                                    </div>
                                </template>
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.hr }} {{ slotProps.data.ci }}</span>
                                </template>
                            </Column>
                            <Column field="ae_rate" header="" v-if="ae_check">
                                <template #header>
                                    <div class="flex items-center gap-2">
                                        <span>AE rate</span>
                                        <i class="pi pi-info-circle text-white cursor-pointer" v-tooltip.top="'Rate of adverse events in the original TTE cohort and the added cohort'"></i>
                                    </div>
                                </template>
                            </Column>
                            <Column field="p_value" header="" v-if="ae_check">
                                <template #header>
                                    <div class="flex items-center gap-2">
                                        <span>P-value</span>
                                        <i class="pi pi-info-circle text-white cursor-pointer" v-tooltip.top="'P-value for testing the null hypothesis that the AE rate in the added cohort is not greater than the original TTE cohort.'"></i>
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </Panel>
                </div>
            </div>
        </SplitterPanel>
    <SplitterPanel :minSize="40" class="flex flex-col p-4"> 
        <div v-if="selected_trial" class="w-full right-panel">
            <div class="details-container mb-6">
                <div class="flex flex-col gap-4 max-w-6xl min-w-fit">
                    <div class="flex flex-row">
                        <div class="flex flex-col border-r-2 border-white border-b-2 border-white min-w-[12rem]">
                            <div class="bg-[#9e2a2b] text-white font-bold px-3 py-2 flex items-center justify-center border-b-2 border-white">Cancer</div>
                            <div class="bg-[#9e2a2b] text-white font-bold px-3 py-2 flex items-center justify-center">Line of Therapy</div>
                        </div>
                        <div class="flex flex-col min-w-[12rem]">
                            <div class="bg-[#e9ecef] text-gray-800 px-4 py-2 font-medium flex items-center justify-center border-b-2 border-white">{{ selected_trial.detailed_data.cancer_short_name || '-' }}</div>
                            <div class="bg-[#e9ecef] text-gray-800 px-4 py-2 font-medium flex items-center justify-center border-r-2 border-white">{{ selected_trial.detailed_data.line_of_treatment || '-' }}</div>
                        </div>

                        <div class="flex flex-col min-w-[12rem]">
                            <div class="bg-[#9e2a2b] text-white font-bold px-3 py-2 flex items-center justify-center border-b-2 border-white">Endpoint</div>
                            <div class="bg-[#9e2a2b] text-white font-bold px-3 py-2 flex items-center justify-center">Trial</div>
                        </div>
                        <div class="flex flex-col min-w-[12rem]">
                            <div class="bg-[#e9ecef] text-gray-800 px-4 py-2 font-medium flex items-center justify-center border-b-2 border-white">{{ selected_trial.detailed_data.endpoint || '-' }}</div>
                            <div class="bg-[#e9ecef] text-gray-800 px-4 py-2 font-medium flex items-center justify-center">{{ selected_trial.trial_name || '-' }}</div>
                        </div>
                    </div>

                    <!-- Group 2: Regimens -->
                    <div class="flex flex-row w-full">
                        <div class="bg-[#9e2a2b] text-white font-bold px-3 py-2 flex items-center justify-center border-r-2 border-white min-w-[12rem]">Regimens</div>
                        <div class="flex flex-row">
                            <div class="flex flex-col border-r-2 border-white min-w-[12rem]">
                                <div class="bg-[#edcbb9] text-gray-800 font-bold px-3 py-2 flex items-center justify-center border-b-2 border-white h-full">Treatment</div>
                                <div class="bg-[#edcbb9] text-gray-800 font-bold px-3 py-2 flex items-center justify-center h-full">Control</div>
                            </div>
                            <div class="flex flex-col min-w-[12rem] flex-1">
                                <div class="bg-[#e9ecef] text-gray-800 px-4 py-2 font-medium flex items-center justify-center border-b-2 border-white h-full">{{ selected_trial.detailed_data.treatment || '-' }}</div>
                                <div class="bg-[#e9ecef] text-gray-800 px-4 py-2 font-medium flex items-center justify-center h-full">{{ selected_trial.detailed_data.control || '-' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <span class="font-bold text-2xl mb-4">Results:</span>
            <div class="w-full mt-2 mb-4">
                <DataTable :value="selected_trial.macro_data" size="small" class="text-sm blue-striped-table" :rowHover="false" style="max-width: 35rem;">
                    <Column field="method_name" header="">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.method_name === 'original'" class="font-bold text-900">Original TTE</span>
                            <span v-else class="font-bold text-900">{{slotProps.data.method_name}}</span>
                        </template>
                    </Column>
                    <Column field="num_patients" bodyClass="text-center">
                        <template #header>
                            <div class="flex items-center justify-center gap-2 w-full">
                                <span># of patients</span>
                                <i class="pi pi-info-circle text-white cursor-pointer" v-tooltip.top="'Number of patient in the cohort'"></i>
                            </div>
                        </template>
                    </Column>
                    <Column field="hr" bodyClass="text-center">
                        <template #header>
                            <div class="flex items-center justify-center gap-2 w-full">
                                <span>HR</span>
                                <i class="pi pi-info-circle text-white cursor-pointer" v-tooltip.top="'Hazard ratio'"></i>
                            </div>
                        </template>
                    </Column>
                    <Column field="ci" bodyClass="text-center">
                        <template #header>
                            <div class="flex items-center justify-center gap-2 w-full">
                                <span>95% Confidence interval</span>
                                <i class="pi pi-info-circle text-white cursor-pointer" v-tooltip.top="'95% confidence interval of hazard ratio'"></i>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="w-full mt-4 mb-4">
                <div class="text-xl font-bold mb-2">OPTIC/OPTIC+ selected eligible criteria:</div>
                <DataTable :value="selected_trial.detailed_data.elegible_criteria" size="small" class="text-sm blue-striped-table" :rowHover="false">
                    <Column header="#" style="width: 3rem">
                        <template #body="slotProps">
                            <span :class="{'text-gray-400': slotProps.data.color === 'grey', 'text-[#c05621]': slotProps.data.color === 'red'}">
                                {{ slotProps.index + 1 }}
                            </span>
                        </template>
                    </Column>
                    <Column field="type" header="Type" style="width: 8rem">
                        <template #body="slotProps">
                            <span :class="{'text-gray-400': slotProps.data.color === 'grey', 'text-[#c05621]': slotProps.data.color === 'red'}">
                                {{ slotProps.data.type }}
                            </span>
                        </template>
                    </Column>
                    <Column field="criteria_description" header="Criteria">
                        <template #body="slotProps">
                            <span :class="{'text-gray-400': slotProps.data.color === 'grey', 'text-[#c05621]': slotProps.data.color === 'red'}">
                                {{ slotProps.data.criteria_description }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
                <div class="text-sm mt-2">
                    <div>*Criteria in grey are not necessary.</div>
                    <div>**Criteria in red are reserved by OPTIC+.</div>
                </div>
            </div>
        </div>
        <div v-else class="flex items-center justify-center h-full text-gray-400">
            Select a trial to see details·
        </div>
    </SplitterPanel>
    </Splitter>
</div>
</Panel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
const emit = defineEmits(['backHome'])
const num_patients_check = ref(true)
const hr_check = ref(true)
const ae_check = ref(true)
const trial_data = ref(null)
const selected_trial = ref(null)

const toggleDetails = (item) => {
    selected_trial.value = selected_trial.value === item ? null : item
}

const getMethodData = (trial, method) => {
    return trial?.macro_data?.find(d => d.method_name === method)
}

const hasOpticPlus = (trial) => {
    return !!getMethodData(trial, 'OPTIC+')
}

const isSignificant = (pVal) => {
    if (!pVal) return false
    const num = parseFloat(pVal)
    return !isNaN(num) && num < 0.05
}

onMounted(async () => {
    try {
        const response = await fetch('/data/data_OPTIC.xlsx');
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const results_worksheet = workbook.Sheets["results"]
        const results_rows = results_worksheet ? XLSX.utils.sheet_to_json(results_worksheet, { defval: null }) : []
        const groupedData = results_rows.reduce((acc, row) => {
            const name = row["trial_name"];
            if (!acc[name]) {
                acc[name] = {
                    trial_name: name,
                    macro_data: [],
                    detailed_data: {}
                };
            }
            // collect macro data
            acc[name].macro_data.push({
                method_name: row["method"] ? row["method"].trim() : row["method"],
                num_criteria: row["number_of_criteria"],
                num_patients: row["number_of_patients"],
                hr: row["hr_ci"].split(" ")[0],
                ci: "(" + row["hr_ci"].split("(")[1],
                ae_rate: row["ae"],
                p_value: row["p_value"]
            });
            return acc;
        }, {});

        trial_data.value = Object.values(groupedData);
        // then collect detailed data
        // first, get each sheet
        const trial_worksheet = workbook.Sheets["trials"]
        const trial_rows = trial_worksheet ? XLSX.utils.sheet_to_json(trial_worksheet, { defval: null }) : []
        const trial_criteria_sheet = workbook.Sheets["trial_criteria"]
        const trial_criteria_rows = trial_criteria_sheet ? XLSX.utils.sheet_to_json(trial_criteria_sheet, { defval: null }) : []
        const criteria_sheet = workbook.Sheets["criteria"]
        const criteria_rows = criteria_sheet ? XLSX.utils.sheet_to_json(criteria_sheet, { defval: null }) : []
        trial_data.value.forEach(item => {
            const cancer_type = trial_rows.find(row => row["trial_name"] === item.trial_name)?.cancer_type
            const match = cancer_type ? cancer_type.match(/\(([^)]+)\)/) : null
            const cancer_short_name = match ? match[1] : cancer_type
            const line_of_treatment = trial_rows.find(row => row["trial_name"] === item.trial_name)?.line_of_therapy
            const treatment = trial_rows.find(row => row["trial_name"] === item.trial_name)?.treatment
            const control = trial_rows.find(row => row["trial_name"] === item.trial_name)?.control.replace('/', ' or ').replace(' + ', ' and ')
            const elegible_criteria = trial_criteria_rows
                .filter(row => row["trial_name"] === item.trial_name)
                .map(row => {
                    const criteria_detail = criteria_rows.find(c => c["criteria_name"] === row["criteria_name"]);
                    return {
                        criteria_name: row["criteria_name"],
                        criteria_description: criteria_detail ? criteria_detail["criteria_description"] : "",
                        type: criteria_detail ? criteria_detail["type"] : null,
                        color: row["OPTIC+ (red)"] ? 'red' : (row["OPTIC (grey)"] ? 'grey' : null)
                    }
                })
            item.detailed_data = {
                cancer_type: cancer_type,
                cancer_short_name: cancer_short_name,
                endpoint:"Overall Survival",
                line_of_treatment: line_of_treatment,
                treatment: treatment,
                control: control,
                elegible_criteria:elegible_criteria
            };
        });
        console.log("Processed Data:", trial_data.value);
    } catch (error) {
        console.error("Error reading Excel file:", error);
    }
})
</script>

<style scoped>
.container {
    margin: 1rem;
    width: 100%;
    max-width: calc(100% - 2rem);
}


:deep(.p-panel-content) {
    padding: 0 !important; 
    border: none !important;
    background: transparent !important;
}

:deep(.p-panel) {
    background: transparent !important;
    border: none !important;
}

:deep(.blue-striped-table .p-datatable-thead > tr > th) {
    background-color: #2c6693; 
    color: white;
    font-weight: bold;
    border: 1px solid #ffffff;
}

:deep(.blue-striped-table .p-datatable-tbody > tr > td) {
    border: 1px solid #ffffff;
    color: #333;
}

:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(odd)) {
    background-color: #eaf4fa;
}

:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #d2e4f0;
}

:deep(.blue-striped-table .p-datatable-tbody > tr:hover) {
    background-color: transparent !important;
}

:deep(.blue-striped-table .p-datatable-tbody > tr) {
    cursor: default !important;
}

:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(odd):hover),
:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(odd).p-highlight) {
    background-color: #eaf4fa !important;
    color: #333 !important;
}

:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(even):hover),
:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(even).p-highlight) {
    background-color: #d2e4f0 !important;
    color: #333 !important;
}
.header-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 0.5rem;
    background-color: #eaf6ff; /* very light baby blue */
}
.details-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    overflow-x: auto;
    overflow-y: visible;
}
.right-panel {
    padding: 1rem;
    overflow: auto;
    height: 100%;
}
</style>