<template>
    <!-- <div class="title-container">
        <img src="../../public/images/logo_large.png" alt="Optic View" style="width: 10rem;"/>
    </div>
    <div class="container">
        <h1>Optic View</h1>
    </div> -->

    <Panel class="container">
    <template #header>
        <div class="flex items-center gap-2">
            <img src="../../public/images/logo_large.png" alt="Optic View" style="width: 10rem; margin-left: 5rem; margin-top: 1rem;"/>
        </div>
    </template>
    <div style="margin: 1rem;">
        <Splitter style="height: calc(100vh - 12rem);">
        <SplitterPanel :minSize="30" :size="30" class="flex flex-col p-0">
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
                            <Column field="num_patients" header="# patients" v-if="num_patients_check"></Column>
                            <Column field="hr_ci" header="HR (95% CI)" v-if="hr_check">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.hr }} {{ slotProps.data.ci }}</span>
                                </template>
                            </Column>
                            <Column field="ae_rate" header="AE rate" v-if="ae_check"></Column>
                            <Column field="p_value" header="P-value" v-if="ae_check"></Column>
                        </DataTable>
                    </Panel>
                </div>
            </div>
        </SplitterPanel>
        <SplitterPanel :minSize="40" class="flex items-center justify-center"> Panel 2 </SplitterPanel>
    </Splitter>
</div>
</Panel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
const num_patients_check = ref(true)
const hr_check = ref(true)
const ae_check = ref(true)
const trial_data = ref(null)
const selected_trial = ref(null)

const toggleDetails = (item) => {
    selected_trial.value = selected_trial.value === item ? null : item
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
                method_name: row["method"],
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

/* Panel 内容区域的内边距和背景色控制 */
:deep(.p-panel-content) {
    padding: 0 !important; /* 移除 Panel 内容区域默认内边距 */
    border: none !important;
    background: transparent !important;
}

/* Panel 整体背景色调整 */
:deep(.p-panel) {
    background: transparent !important;
    border: none !important;
}

/* 表格样式自定义 */
:deep(.blue-striped-table .p-datatable-thead > tr > th) {
    background-color: #2c6693; /* 深蓝色表头 */
    color: white;
    font-weight: bold;
    border: 1px solid #ffffff;
}

:deep(.blue-striped-table .p-datatable-tbody > tr > td) {
    border: 1px solid #ffffff;
    color: #333;
}

/* 奇数行 - 极浅蓝 */
:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(odd)) {
    background-color: #eaf4fa;
}

/* 偶数行 - 稍深的浅蓝 */
:deep(.blue-striped-table .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #d2e4f0;
}

/* 悬停效果略微加深 */
:deep(.blue-striped-table .p-datatable-tbody > tr:hover) {
    background-color: transparent !important; /* 禁用悬停变色，或者保持原色 */
}

/* 强制覆盖悬停和选中样式，保持条纹色，并移除鼠标手型 */
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
</style>