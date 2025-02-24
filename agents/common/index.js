"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInteractor = exports.TransactionMonitor = void 0;
var TransactionMonitor = /** @class */ (function () {
    function TransactionMonitor(provider, pollingInterval) {
        if (pollingInterval === void 0) { pollingInterval = 5000; }
        this.provider = provider;
        this.pollingInterval = pollingInterval;
    }
    TransactionMonitor.prototype.waitForTransaction = function (txHash, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var receipt, status_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 10];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 9]);
                        return [4 /*yield*/, this.provider.getTransactionReceipt(txHash)];
                    case 2:
                        receipt = _a.sent();
                        if (!callback) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.provider.getTransactionStatus(txHash)];
                    case 3:
                        status_1 = _a.sent();
                        callback(status_1);
                        _a.label = 4;
                    case 4:
                        if (receipt.finality_status === 'ACCEPTED_ON_L2' ||
                            receipt.finality_status === 'ACCEPTED_ON_L1') {
                            return [3 /*break*/, 10];
                        }
                        if (receipt.execution_status === 'REVERTED') {
                            throw new Error("Transaction ".concat(txHash, " was reverted"));
                        }
                        return [4 /*yield*/, new Promise(function (resolve) {
                                return setTimeout(resolve, _this.pollingInterval);
                            })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        error_1 = _a.sent();
                        if (!error_1.message.includes('Transaction hash not found')) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                return setTimeout(resolve, _this.pollingInterval);
                            })];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 8: throw error_1;
                    case 9: return [3 /*break*/, 0];
                    case 10: return [2 /*return*/, receipt];
                }
            });
        });
    };
    TransactionMonitor.prototype.getTransactionEvents = function (txHash) {
        return __awaiter(this, void 0, void 0, function () {
            var receipt, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.provider.getTransactionReceipt(txHash)];
                    case 1:
                        receipt = _a.sent();
                        return [2 /*return*/, receipt.events || []];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Failed to get transaction events: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TransactionMonitor.prototype.watchEvents = function (fromBlock_1) {
        return __awaiter(this, arguments, void 0, function (fromBlock, toBlock, callback) {
            var currentBlock, latestBlock, _a, block, events, _i, _b, tx, receipt, error_3;
            var _this = this;
            if (toBlock === void 0) { toBlock = 'latest'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentBlock = fromBlock;
                        _c.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 15];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 12, , 14]);
                        if (!(toBlock === 'latest')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.provider.getBlockNumber()];
                    case 3:
                        _a = _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = toBlock;
                        _c.label = 5;
                    case 5:
                        latestBlock = _a;
                        if (currentBlock > latestBlock) {
                            return [3 /*break*/, 15];
                        }
                        return [4 /*yield*/, this.provider.getBlockWithTxs(currentBlock)];
                    case 6:
                        block = _c.sent();
                        events = [];
                        _i = 0, _b = block.transactions;
                        _c.label = 7;
                    case 7:
                        if (!(_i < _b.length)) return [3 /*break*/, 10];
                        tx = _b[_i];
                        if (!tx.transaction_hash) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.provider.getTransactionReceipt(tx.transaction_hash)];
                    case 8:
                        receipt = _c.sent();
                        if (receipt.events) {
                            events.push.apply(events, receipt.events);
                        }
                        _c.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10:
                        if (events.length > 0) {
                            callback(events);
                        }
                        currentBlock++;
                        return [4 /*yield*/, new Promise(function (resolve) {
                                return setTimeout(resolve, _this.pollingInterval);
                            })];
                    case 11:
                        _c.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        error_3 = _c.sent();
                        console.error('Error watching events:', error_3);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                return setTimeout(resolve, _this.pollingInterval);
                            })];
                    case 13:
                        _c.sent();
                        return [3 /*break*/, 14];
                    case 14: return [3 /*break*/, 1];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    TransactionMonitor.prototype.getTransactionStatus = function (txHash) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.provider.getTransactionStatus(txHash)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Failed to get transaction status: ".concat(error_4.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TransactionMonitor;
}());
exports.TransactionMonitor = TransactionMonitor;
// ContractIterator
// src/lib/utils/contract/ContractInteractor.ts
var starknet_1 = require("starknet");
var ContractInteractor = /** @class */ (function () {
    function ContractInteractor(provider) {
        this.provider = provider;
    }
    ContractInteractor.prototype.deployContract = function (account_1, classHash_1) {
        return __awaiter(this, arguments, void 0, function (account, classHash, constructorCalldata, salt) {
            var deployPayload, _a, transaction_hash, contract_address, error_5;
            if (constructorCalldata === void 0) { constructorCalldata = []; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        deployPayload = {
                            classHash: classHash,
                            constructorCalldata: starknet_1.CallData.compile(constructorCalldata),
                            salt: salt || starknet_1.hash.getSelectorFromName(Math.random().toString()),
                        };
                        return [4 /*yield*/, account.deploy(deployPayload)];
                    case 1:
                        _a = _b.sent(), transaction_hash = _a.transaction_hash, contract_address = _a.contract_address;
                        return [4 /*yield*/, this.provider.waitForTransaction(transaction_hash)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                transactionHash: transaction_hash,
                                contractAddress: contract_address,
                            }];
                    case 3:
                        error_5 = _b.sent();
                        throw new Error("Failed to deploy contract: ".concat(error_5.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ContractInteractor.prototype.estimateContractDeploy = function (account_1, classHash_1) {
        return __awaiter(this, arguments, void 0, function (account, classHash, constructorCalldata, salt) {
            var deployPayload;
            if (constructorCalldata === void 0) { constructorCalldata = []; }
            return __generator(this, function (_a) {
                try {
                    deployPayload = {
                        classHash: classHash,
                        constructorCalldata: starknet_1.CallData.compile(constructorCalldata),
                        salt: salt || starknet_1.hash.getSelectorFromName(Math.random().toString()),
                    };
                    return [2 /*return*/, account.estimateDeployFee(deployPayload)];
                }
                catch (error) {
                    throw new Error("Failed to estimate contract deploy: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    ContractInteractor.prototype.multicall = function (account, calls) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction_hash, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, account.execute(calls)];
                    case 1:
                        transaction_hash = (_a.sent()).transaction_hash;
                        return [4 /*yield*/, this.provider.waitForTransaction(transaction_hash)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                status: 'success',
                                transactionHash: transaction_hash,
                            }];
                    case 3:
                        error_6 = _a.sent();
                        return [2 /*return*/, {
                                status: 'failure',
                                error: error_6.message,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ContractInteractor.prototype.estimateMulticall = function (account, calls) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, account.estimateInvokeFee(calls)];
                }
                catch (error) {
                    throw new Error("Failed to estimate multicall: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    ContractInteractor.prototype.createContract = function (abi, address, account) {
        return new starknet_1.Contract(abi, address, account || this.provider);
    };
    ContractInteractor.prototype.readContract = function (contract_1, method_1) {
        return __awaiter(this, arguments, void 0, function (contract, method, args) {
            var error_7;
            if (args === void 0) { args = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, contract.call(method, args)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Failed to read contract: ".concat(error_7.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ContractInteractor.prototype.writeContract = function (contract_1, method_1) {
        return __awaiter(this, arguments, void 0, function (contract, method, args) {
            var transaction_hash, error_8;
            if (args === void 0) { args = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, contract.invoke(method, args)];
                    case 1:
                        transaction_hash = (_a.sent()).transaction_hash;
                        return [4 /*yield*/, this.provider.waitForTransaction(transaction_hash)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                status: 'success',
                                transactionHash: transaction_hash,
                            }];
                    case 3:
                        error_8 = _a.sent();
                        return [2 /*return*/, {
                                status: 'failure',
                                error: error_8.message,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ContractInteractor.prototype.estimateContractWrite = function (contract_1, method_1) {
        return __awaiter(this, arguments, void 0, function (contract, method, args) {
            var error_9;
            if (args === void 0) { args = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!contract.account) {
                            throw new Error('Contract must be connected to an account to estimate fees');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, contract.estimate(method, args)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_9 = _a.sent();
                        throw new Error("Failed to estimate contract write: ".concat(error_9.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ContractInteractor.prototype.formatTokenAmount = function (amount, decimals) {
        if (decimals === void 0) { decimals = 18; }
        var value = typeof amount === 'string' ? amount : amount.toString();
        var _a = value.split('.'), whole = _a[0], _b = _a[1], fraction = _b === void 0 ? '' : _b;
        var paddedFraction = fraction.padEnd(decimals, '0');
        return whole + paddedFraction;
    };
    ContractInteractor.prototype.parseTokenAmount = function (amount, decimals) {
        if (decimals === void 0) { decimals = 18; }
        var amountBigInt = BigInt(amount);
        var divisor = Math.pow(BigInt(10), BigInt(decimals));
        var wholePart = amountBigInt / divisor;
        var fractionPart = amountBigInt % divisor;
        var paddedFraction = fractionPart.toString().padStart(decimals, '0');
        return "".concat(wholePart, ".").concat(paddedFraction);
    };
    return ContractInteractor;
}());
exports.ContractInteractor = ContractInteractor;
