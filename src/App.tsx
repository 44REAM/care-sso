import React, { useState, useEffect } from "react";
import "./App.css";

// Define TypeScript interfaces for our data structures
interface YearData {
	M: number;
	i: number | null;
	compensate: number;
}

interface StaticDataType {
	[year: string]: YearData;
}

interface MoneyDataType {
	[year: string]: number;
}

interface MonthDataType {
	[year: string]: number;
}

// Changed from string to number
interface RateDataType {
	[year: string]: number;
}

interface PensionPointType {
	[year: string]: number;
}

interface CompensateDataType {
	[year: string]: number;
}

interface CalculationResult {
	ReValue33: { [year: string]: number };
	totalCumMonths: { [year: string]: number };
	systemAvg: { [year: string]: number };
	finalCombinedAmount: number;
	pensionPercentage: number;
	pensionAmount: number;
	oldPensionAmount: number;
	compensatedPension: number;
	years: string[];
}


const minYear = 2541;
const maxYear = 2610;

const generateStaticData = (): StaticDataType => {
	const baseData: StaticDataType = {
		"2541": { M: 15000, i: 6346.139723, compensate: 100 },
		"2542": { M: 15000, i: 6350.60594, compensate: 100 },
		"2543": { M: 15000, i: 6341.846618, compensate: 100 },
		"2544": { M: 15000, i: 6429.873092, compensate: 100 },
		"2545": { M: 15000, i: 6455.538628, compensate: 100 },
		"2546": { M: 15000, i: 6505.509517, compensate: 100 },
		"2547": { M: 15000, i: 6634.378432, compensate: 100 },
		"2548": { M: 15000, i: 6884.349202, compensate: 100 },
		"2549": { M: 15000, i: 7168.80093, compensate: 100 },
		"2550": { M: 15000, i: 7407.968684, compensate: 100 },
		"2551": { M: 15000, i: 7734.514019, compensate: 100 },
		"2552": { M: 15000, i: 7959.639781, compensate: 100 },
		"2553": { M: 15000, i: 8106.109708, compensate: 100 },
		"2554": { M: 15000, i: 8468.189411, compensate: 100 },
		"2555": { M: 15000, i: 9491.804267, compensate: 100 },
		"2556": { M: 15000, i: 10274.200081, compensate: 100 },
		"2557": { M: 15000, i: 10555.369553, compensate: 100 },
		"2558": { M: 15000, i: 10762.094766, compensate: 100 },
		"2559": { M: 15000, i: 10919.627747, compensate: 100 },
		"2560": { M: 15000, i: 11127.955886, compensate: 100 },
		"2561": { M: 15000, i: 11245.14181, compensate: 100 },
		"2562": { M: 15000, i: 11391.147582, compensate: 100 },
		"2563": { M: 15000, i: 11473.296854, compensate: 100 },
		"2564": { M: 15000, i: 11584.696478, compensate: 100 },
		"2565": { M: 15000, i: 11750.943529, compensate: 100 },
		"2566": { M: 15000, i: 11944.164759, compensate: 100 },
		"2567": { M: 15000, i: 12133.248417, compensate: 100 },
		"2568": { M: 15000, i: 12497.24587, compensate: 100 },
		"2569": { M: 17500, i: 13372.053081, compensate: 100 },
		"2570": { M: 17500, i: 13906.935204, compensate: 80 },
		"2571": { M: 17500, i: 14602.281964, compensate: 60 },
		"2572": { M: 20000, i: 15478.418882, compensate: 40 },
		"2573": { M: 20000, i: 16097.555637, compensate: 20 },
		"2574": { M: 20000, i: 16741.457863, compensate: 0 },
		"2575": { M: 23000, i: 17411.116177, compensate: 0 },
		"2576": { M: 23000, i: 18281.671986, compensate: 0 },
		"2577": { M: 23000, i: 19012.938866, compensate: 0 }
	};

	const lastYear = 2577;
	const lastData = baseData["2577"];
	let currentM = lastData.M;
	let currentI = lastData.i;

	for (let year = lastYear + 1; year <= maxYear; year++) {
		currentM = Math.round(currentM * 1.04);

		if (currentI == null) throw new Error(`กรุณากรอกค่า i สำหรับปี ${year}`);
		currentI = currentI * 1.04;
		baseData[year.toString()] = {
			M: currentM,
			i: currentI,
			compensate: 0
		};
	}

	return baseData;
};

const staticData: StaticDataType = generateStaticData();


const getYearArray = (start: number, end: number): string[] => {
	const years: string[] = [];
	for (let y = Math.min(Math.max(start, minYear), Math.max(end, minYear)); y <= Math.max(Math.min(end, maxYear), Math.min(start, maxYear)); y++) {
		years.push(String(y));
	}
	return years;
};

const calculateOldFormula = (
	startYear: number,
	endYear: number,
	moneyData: MoneyDataType,
	month33Data: MonthDataType,

): number => {

	const oldMonth: number[] = [];
	const avgMoney: number[] = [];
	let totalMonth = 0;
	let year = endYear;

	while (totalMonth < 60) {
		// Convert year to string since our objects are indexed by string keys
		const yearKey = year.toString();

		// Get the values or assume 0 if not available
		const value33 = month33Data[yearKey] || 0;

		const sumForYear = value33;

		const money33 = moneyData[yearKey] || 0;
		if (sumForYear > 0) {
			avgMoney.push((value33 * money33) / sumForYear)
		} else {
			avgMoney.push(0)
		}

		// Add the values to the running total and store the year in the list.
		totalMonth += sumForYear;
		if (totalMonth >= 60) {
			oldMonth.push(sumForYear - (totalMonth - 60));
		} else {
			oldMonth.push(sumForYear);
		}

		// Move to the previous year
		year--;
		// Stop if year becomes negative (or some reasonable lower bound if needed)
		if (year < startYear) {
			break;
		}
	}
	if (oldMonth.length !== avgMoney.length) {
		throw new Error("Arrays must be of the same length");
	}
	let weightedSum = 0;
	let weightTotal = 0;

	for (let i = 0; i < oldMonth.length; i++) {
		weightedSum += avgMoney[i] * oldMonth[i];
		weightTotal += oldMonth[i];
	}

	return weightTotal !== 0 ? weightedSum / weightTotal : 0;
}

function calculateSystemFAE(
	targetYear: number,
	windowLength = 5
) {

	// Turn the keys into numbers & sort ascending
	const years = Object.keys(staticData)
		.map((y) => parseInt(y, 10))
		.filter((y) => !isNaN(y))
		.sort((a, b) => a - b)

	// Find the index of the target year in that sorted list
	const idx = years.indexOf(targetYear)
	if (idx === -1) {
		throw new Error(`Year ${targetYear} not found in staticData`)
	}

	// Compute start index so we get up to 'windowLength' years (inclusive)
	const start = Math.max(0, idx - (windowLength - 1))

	let sum = 0
	let sumMax = 0
	let count = 0

	for (let i = start; i <= idx; i++) {
		const y = years[i]
		const entry = staticData[y]
		if (entry.i == null){
			throw new Error(`กรุณากรอกค่า i สำหรับปี ${y}`);
		}
		sum += entry.i
		sumMax += entry.M
		count++
	}

	const avg = count > 0 ? sum / count : 0
	const max = count > 0 ? sumMax / count : 0

	return {avg, max}
}


function multiplyByYearFactors(
	years: string[],
	data: MoneyDataType,
	factors: StaticDataType
): PensionPointType {
	const result: PensionPointType = {}

	for (const year of years) {

		const row = data[year]
		const factor = factors[year]
		// If there's no factor for this year, just copy the original row
		if (factor.i == null){
			throw new Error(`กรุณากรอกค่า i สำหรับปี ${year}`);
		}
		result[year] = row / factor.i;

	}

	return result
}
function weightedAverageByYear(
	years: string[],
	moneyByYear: PensionPointType,
	weightByYear: MonthDataType
) {
	let sumProduct = 0
	let sumWeight = 0
	const cumMonth: MonthDataType = {};

	for (const year of years) {
		const money = moneyByYear[year]
		const weight = weightByYear[year] ?? 0  // if no weight for that year, treat as 0

		sumProduct += money * weight
		sumWeight += weight
		cumMonth[year] = sumWeight
	}
	const avg = sumWeight > 0 ? sumProduct / sumWeight : 0;
	// Avoid division by zero
	return {avg, cumMonth}
}

const calculateCARE = (
	startYear: number,
	endYear: number,
	moneyData: MoneyDataType,
	month33Data: MonthDataType,
	rateData: RateDataType,
	conpensate: CompensateDataType
): CalculationResult => {

	const years = getYearArray(startYear, endYear);


	const dataOverride: { [key: string]: YearData } = {};
	Object.keys(staticData).forEach((yr) => {
		if (parseInt(yr) > endYear) return;
		if (!staticData[yr]) {
			throw new Error(`ไม่มีข้อมูลสำหรับปี ${yr}`);
		}
		let iVal = staticData[yr].i;
		if (iVal === null || parseInt(yr) >= 2568) {
			if (rateData[yr] === undefined || isNaN(rateData[yr])) {
				throw new Error(`กรุณากรอกค่า i สำหรับปี ${yr}`);
			}
			iVal = rateData[yr];
			if (isNaN(iVal)) {
				throw new Error(`ค่า i สำหรับปี ${yr} ไม่ถูกต้อง`);
			}
			if (iVal < 1) {
				throw new Error(`ค่า i สำหรับปี ${yr} ต้องมีค่าตั้งแต่ 1 ขึ้นไป`);
			}
		}
		dataOverride[yr] = { ...staticData[yr], i: iVal };
	});


	const pp: PensionPointType = multiplyByYearFactors(years, moneyData, staticData)

	const { avg:avgPP,cumMonth: cumMonth } = weightedAverageByYear(years,  pp, month33Data);

	const oldFinalCombinedAmount = calculateOldFormula(startYear, endYear, moneyData, month33Data);
	const {avg: systemFAE, max: maxCARE} = calculateSystemFAE(endYear);
	const calculatedCARE = avgPP*systemFAE
	const CARE = Math.min(calculatedCARE, maxCARE);

	const totalMonths = cumMonth[years[years.length - 1]];

	let pensionPercentage;
	if (totalMonths <= 180) {
		pensionPercentage = 0.20;
	} else {
		pensionPercentage = 0.20 + 0.00125 * (totalMonths - 180);
	}
	const pensionAmount = CARE*pensionPercentage
	const oldPensionAmount = pensionPercentage * oldFinalCombinedAmount;

	const compensatedPension = pensionAmount + Math.max(oldPensionAmount - pensionAmount, 0) * conpensate[years[years.length - 1]] / 100
	const systemAvg = years.reduce(
		(acc, year) => {
		  const entry = staticData[year];
		  if (entry && entry.i !== null) {
			acc[year] = entry.i;  // now TS knows `.i` is a `number`
		  }
		  return acc;
		},
		{} as MoneyDataType
	  );

	return {
		ReValue33: pp,
		totalCumMonths: cumMonth,
		systemAvg: systemAvg,
		finalCombinedAmount: CARE,
		pensionPercentage: pensionPercentage,
		pensionAmount: pensionAmount,
		oldPensionAmount: oldPensionAmount,
		compensatedPension: compensatedPension,
		years: years
	};
};


function formatNumber(num: number): string {
	return num.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}


const CAREPensionCalculator: React.FC = () => {
	const [startYear, setStartYear] = useState<number>(2541);
	const [endYear, setEndYear] = useState<number>(2569);
	const [moneyData, setMoneyData] = useState<MoneyDataType>({});
	const [month33Data, setMonth33Data] = useState<MonthDataType>({});
	const [rateData, setRateData] = useState<RateDataType>({});
	const [conpensate, setCompensate] = useState<CompensateDataType>({});
	const [result, setResult] = useState<CalculationResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState<boolean>(false);
	const [showDetails, setShowDetails] = useState<boolean>(false);



	const handleMonth33Change = (yr: string, value: string): void => {
		const m33Value = parseInt(value, 10) || 0;
		
		if (m33Value > 12) {
			setError(`จำนวนเดือนรวม (ม.33 + ม.39) สำหรับปี ${yr} ต้องไม่เกิน 12 เดือน`);
			return;
		}
		
		setError(null);
		setMonth33Data(prev => ({ ...prev, [yr]: m33Value }));
		
		if (m33Value === 0) {
			setMoneyData(prev => ({ ...prev, [yr]: 0 }));
		} else if (m33Value > 0 && moneyData[yr] <= 0) {
			setMoneyData(prev => ({ ...prev, [yr]: 1650 }));
		}
	};

	// Initialize data for the years range
	const initializeYearData = (start: number, end: number): void => {
		const years = getYearArray(start, end);
		setMoneyData((prev) => {
			const newData: MoneyDataType = {};
			years.forEach((yr) => {
				newData[yr] = prev[yr] !== undefined ? prev[yr] : 15000;
			});
			return newData;
		});
		setMonth33Data((prev) => {
			const newData: MonthDataType = {};
			years.forEach((yr) => {
				newData[yr] = prev[yr] !== undefined ? prev[yr] : 12;
			});
			return newData;
		});

		setRateData((prev) => {
			const newData: RateDataType = {};
			years.forEach((yr) => {
				if (staticData[yr]) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : (staticData[yr].i as number);
				}
			});
			return newData;
		});
		setCompensate((prev) => {
			const newData: CompensateDataType = {};
			years.forEach((yr) => {
				if (staticData[yr]) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : (staticData[yr].compensate as number);
				}
			});
			return newData;
		});
		setIsInitialized(true);
	};

	// Initial setup (only once)
	useEffect(() => {
		initializeYearData(minYear, maxYear);
	}, []);

	const handleCalculation = (): void => {
		setError(null);

		try {
			const years = getYearArray(startYear, endYear);
			if (startYear < minYear) {
				throw new Error(`ปีเริ่มต้นต้องไม่น้อยกว่า ${startYear}`);
			}
			if (endYear > maxYear) {
				throw new Error(`ปีสุดท้ายต้องไม่เกิน ${endYear}`);
			}
			for (const yr of years) {
				if (isNaN(moneyData[yr])) {
					throw new Error(`ค่าเงินค่าจ้างไม่ถูกต้องสำหรับปี ${yr}`);
				}

				const m33Value = month33Data[yr] || 0;

				if (isNaN(m33Value) || m33Value < 0) {
					throw new Error(`จำนวนเดือน ม.33 ไม่ถูกต้องสำหรับปี ${yr}`);
				}


				if (m33Value > 12) {
					throw new Error(`จำนวนเดือนรวม (ม.33 + ม.39) สำหรับปี ${yr} ต้องไม่เกิน 12 เดือน`);
				}

				if ((m33Value <= 0) && moneyData[yr] > 0) {
					throw new Error(`จำนวนเดือนรวม (ม.33 + ม.39) สำหรับปี ${yr} ต้องมากกว่า 0`);
				}
				if ((m33Value > 0) && moneyData[yr] <= 0) {
					throw new Error(`ค่าเงินค่าจ้างไม่ถูกต้องสำหรับปี ${yr} เงินค่าจ้างต้องมากกว่า 1650 บาท`);
				}

				if (parseInt(yr) >= 2568) {
					if (isNaN(rateData[yr]) || rateData[yr] <= 0) {
						throw new Error(`ค่า i ไม่ถูกต้องสำหรับปี ${yr}`);
					}
					if (rateData[yr] < 1) {
						throw new Error(`ค่า i สำหรับปี ${yr} ต้องมีค่าตั้งแต่ 1 ขึ้นไป`);
					}
				}
			}
			const calcResult = calculateCARE(startYear, endYear, moneyData, month33Data, rateData, conpensate);
			setResult(calcResult);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message || "Error during calculation");
			} else {
				setError("Unknown error occurred during calculation");
			}
			setResult(null);
		}
	};

	if (!isInitialized) {
		return <div>Loading...</div>;
	}

	return (
		<div className="bg-gray-50 p-6 rounded-lg shadow-md max-w-5xl mx-auto">
			<h1 className="text-2xl font-bold text-center mb-6 text-blue-700">การคำนวณค่าบำนาญสูตร CARE</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div>
					<label className="block text-gray-700 mb-2">
						ปีทีี่เริ่มส่งเงินสมทบ (เช่น 2541):
						<div className="flex mt-1">
							<input
								type="number"
								className="w-full p-2 border rounded-l"
								value={startYear}
								onChange={(e) => setStartYear(parseInt(e.target.value))}
								onBlur={(e) => {
									const inputValue = e.target.value;
									const parsedValue = parseInt(inputValue);
									if (!isNaN(parsedValue) && parsedValue >= minYear && parsedValue <= maxYear) {
										setStartYear(parsedValue);
									} else {
										setStartYear(minYear); // or some default or error handling
									}
								}}
								min={minYear}
								max={maxYear}
							/>
						</div>
					</label>
				</div>
				<div>
					<label className="block text-gray-700 mb-2">
						ปีที่เกิดสิทธิรับบำนาญ (เช่น 2556):
						<div className="flex mt-1">
							<input
								type="number"
								className="w-full p-2 border rounded-l"
								value={endYear}
								onChange={(e) => setEndYear(parseInt(e.target.value))}
								onBlur={(e) => {
									const inputValue = e.target.value;
									const parsedValue = parseInt(inputValue);
									if (!isNaN(parsedValue) && parsedValue >= minYear && parsedValue <= maxYear) {
										setEndYear(parsedValue);
									} else {
										setEndYear(maxYear); // or some default or error handling
									}
								}}
								min={minYear}
								max={maxYear}
							/>
						</div>
					</label>
				</div>
			</div>

			<div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
				<h2 className="text-xl font-semibold mb-3">กรอกข้อมูลประจำปี</h2>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse border border-gray-300 text-sm">
						<thead className="bg-gray-100">
							<tr>
								<th className="p-2 border">ปี พ.ศ.</th>
								<th className="p-2 border">ค่าจ้างเฉลี่ย</th>
								<th className="p-2 border">เดือนที่ส่งประกันสังคม</th>
								<th className="p-2 border">เพดานค่าจ้าง</th>
								{/* Remove index column from main table */}
							</tr>
						</thead>
						<tbody>
							{getYearArray(startYear, endYear).map((yr) => (
								<tr key={yr} className="hover:bg-gray-50">
									<td className="p-2 border text-center">{yr}</td>

									<td className="p-2 border text-right">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={(moneyData[yr] || 0).toString()}
											onChange={(e) =>
												setMoneyData({
													...moneyData,
													[yr]: parseFloat(e.target.value),
												})
											}
											onBlur={(e) => {
												const inputValue = e.target.value;
												const parsedValue = parseFloat(inputValue);
												if (
													!isNaN(parsedValue) &&
													parsedValue >= 1650 &&
													parsedValue <= staticData[yr].M
												) {
													setMoneyData({
														...moneyData,
														[yr]: parseFloat(e.target.value),
													});
												} else if (month33Data[yr] === 0) {
													setMoneyData({
														...moneyData,
														[yr]: 0,
													});
												} else if (parsedValue < 1650) {
													setMoneyData({
														...moneyData,
														[yr]: 1650,
													});
												} else {
													setMoneyData({
														...moneyData,
														[yr]: staticData[yr].M,
													});
												}
											}}
											min="1650"
											step="1"
											inputMode="numeric"
											placeholder="กรอกค่าจ้างเฉลี่ย P[t]"
											style={{ minWidth: '100px' }}
										/>
									</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={(month33Data[yr] || 0).toString()}
											onChange={(e) => handleMonth33Change(yr, e.target.value)}
											min="0"
											max="12"
											step="1"
											inputMode="numeric"
											style={{ minWidth: '50px' }}
										/>
									</td>
									<td className="p-2 border text-center">{staticData[yr].M}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<button
				className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
				onClick={handleCalculation}
			>
				คำนวณ
			</button>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<strong>Error:</strong> {error}
				</div>
			)}
			{result && (
				<div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">ฐานเงินบำนาญ</h3>
							<p className="text-2xl font-bold text-blue-800">{formatNumber(result.finalCombinedAmount)} บาท</p>
							<p className="text-sm text-gray-600">ค่าเฉลี่ยถ่วงน้ำหนักระหว่าง ม.33 และ ม.39</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg border border-green-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">เปอร์เซนต์เงินบำนาญ</h3>
							<p className="text-2xl font-bold text-purple-800">{(result.pensionPercentage * 100).toFixed(2)}%</p>
							<p className="text-sm text-gray-600">จำนวนเดือนสะสมทั้งหมด: {result.totalCumMonths[result.years[result.years.length - 1]]}</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">จำนวนเงินบำนาญที่ปีสิทธิ {endYear}</h3>
							<p className="text-2xl font-bold text-purple-800">{formatNumber(result.compensatedPension)} บาท</p>
							<p className="text-sm text-gray-600">*สูตรเก่าจะได้ {formatNumber(result.oldPensionAmount)} บาท (ชดเชย {conpensate[endYear]}%)</p>
						</div>
					</div>
					* ระบบคำนวณบำนาญจริงจะคิด คะแนน Pension Point เป็นรายเดือน
แอปนี้ทำการคำนวณ เป็นรายปี เพื่อให้ใช้ง่าย และใช้เป็นเพียง การประมาณการเบื้องต้น เท่านั้น

ในการคำนวณ แอปจะสมมติว่า 1. ค่าจ้างเฉลี่ย ม.33 ในอนาคต จะเพิ่มขึ้นปีละ 4% จากค่าจ้างปัจจุบัน 2. เพดานค่าจ้าง จะเริ่มเพิ่มขึ้นปีละ 4% ตั้งแต่ปี 2577
					<button
						className="text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
						onClick={() => setShowDetails(!showDetails)}
					>
						{showDetails ? "ซ่อนตารางคำนวณ ▲" : "แสดงตารางคำนวณ ▼"}
					</button>

					{showDetails && (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse border border-gray-300 text-sm">
								<thead className="bg-gray-100">
									<tr>
										<th className="p-2 border">ปี</th>
										<th className="p-2 border">ค่าจ้างเฉลี่ยม.33</th>
										<th className="p-2 border">Pension Point</th>
										<th className="p-2 border">จำนวนเดือนสะสม</th>
									</tr>
								</thead>
								<tbody>
									{result.years.map((yr) => (
										<tr key={yr} className="hover:bg-gray-50">
											<td className="p-2 border text-center">{yr}</td>
											<td className="p-2 border text-right">{result.systemAvg[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.ReValue33[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.totalCumMonths[yr]}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					{/* <a href="/CARE_SSO_v2.0.pdf" download="CARE_SSO_v2.0.pdf" className="download-button">
						อ่านรายละเอียดเพิ่มเติม
					</a> */}
				</div>
			)}



		</div>
	);
};

export default CAREPensionCalculator;