const fs = require('fs');
const csv = require('fast-csv');

const directoryPath = './data';

let changeSurname = (data) => {
    switch(data.last_name + data.first_name) {
        case 'Чікал' +  'Адам':
            return 'Чикал';

        case 'Таран (Терен)' +  'Віктор':
        case 'Таран-Терен' + 'Віктор':
            return  'Таран';

        case 'Анненков' +  'Єгор':
            return  'Аннєнков';

        case 'Плужніков' + 'Ігор':
            return  'Плужников';

        case 'Бєлоусова' + 'Ірина':
            return 'Белоусова';
        case 'Пискуновський' + 'Костянтин':
            return  'Піскуновський';

        case 'Джемілев' + 'Мустафа':
            return  'Джемілєв';

        case 'Чмир' + data.first_name === 'Юрій':
            return  'Чмирь';

        case 'Грачов' + data.first_name === 'Олег':
            return  'Грачев';

        case 'Веретенніков' + data.first_name === 'Віктор':
            return  'Веретенников';

        case 'Кожевников' + data.first_name === 'Борис':
            return  'Кожевніков';

        case 'Коломойцев' + data.first_name === 'Валерій':
            return 'Коломойцев-Рибалка';

        default:
            return  data.last_name;
    }

};


function concatCSVAndOutput(csvDataPaths, outputFilePath) {
    const promises = csvDataPaths.map((path) => {
        return new Promise((resolve) => {
            const dataArray = [];
            return csv
                .parseFile(path, {headers: true})
                .transform(data => ({
                    id: data.id,
                    convocation: data.convocation,
                    gender: data.gender,
                    birthday: data.birthday,
                    last_name: data.last_name = changeSurname(data),
                    first_name: data.first_name

                }))
                .on('data', function(data) {
                    dataArray.push(data);

                })
                .on('end', function() {
                    resolve(dataArray);
                });
        });
    });

    return Promise.all(promises)
        .then((results) => {

            const csvStream = csv.format({headers: true});
            const writableStream = fs.createWriteStream(outputFilePath);

            writableStream.on('finish', function() {
                console.log('DONE!');
            });

            csvStream.pipe(writableStream);
            results.forEach((result) => {
                result.forEach((data) => {

                    csvStream.write(data);
                });
            });
            csvStream.end();

        });
}

let getFilesPaths = (directoryPath) => {
    let filesArray = fs.readdirSync(directoryPath);
    filesArray.forEach((file,i,filesArray) => {
        filesArray[i] = directoryPath + '/' + file;
        //console.log(file);
    });
    return filesArray;
};

let filterFiles = (filesPaths) => {
    return filesPaths.filter((file) => {
        return file.includes('.csv');
    });
};

let getDataPaths = (directoryPath) => {
    let filesPaths = getFilesPaths(directoryPath);
   return filterFiles(filesPaths)
};

concatCSVAndOutput(getDataPaths(directoryPath), "./data/merged_data_rows_excluded.csv"). then();











