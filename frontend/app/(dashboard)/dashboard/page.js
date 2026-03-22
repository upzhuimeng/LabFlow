
'use client';

import React, { useState, useEffect } from 'react';
import DashboardCard from '@/components/DashboardCard';
import DashboardTable from '@/components/DashboardTable';
import DashboardModal from '@/components/DashboardModal';

// 新增API服务函数
const instrumentApi = {
  // 获取仪器列表
  getInstruments: async (page = 1, pageSize = 10) => {
    const myHeaders = new Headers();
    // 从localStorage或cookie中获取token，如果存在的话
    const token = document.cookie.match(/access_token=([^;]+)/)?.[1] || 
                  localStorage.getItem('access_token');
    
    if (token) {
      myHeaders.append("Authorization", `Bearer ${token}`);
    }
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    try {
      const response = await fetch(`/instrument?page=${page}&page_size=${pageSize}`, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('获取仪器列表失败:', error);
      throw error;
    }
  },

  // 创建新仪器
  createInstrument: async (instrumentData) => {
    const myHeaders = new Headers();
    const token = document.cookie.match(/access_token=([^;]+)/)?.[1] || 
                  localStorage.getItem('access_token');
    
    if (token) {
      myHeaders.append("Authorization", `Bearer ${token}`);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(instrumentData);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    try {
      const response = await fetch('/instrument', requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('创建仪器失败:', error);
      throw error;
    }
  },

  // 更新仪器
  updateInstrument: async (id, instrumentData) => {
    const myHeaders = new Headers();
    const token = document.cookie.match(/access_token=([^;]+)/)?.[1] || 
                  localStorage.getItem('access_token');
    
    if (token) {
      myHeaders.append("Authorization", `Bearer ${token}`);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(instrumentData);
    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    try {
      const response = await fetch(`/instrument/${id}`, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('更新仪器失败:', error);
      throw error;
    }
  }
};

export default function Dashboard() {
  // 状态管理
  const [overview, setOverview] = useState({
    deviceTotal: 0,
    labTechnicians: 0,
    currentProjects: 0
  });

  const [deviceStatus, setDeviceStatus] = useState({
    available: 0,  // 可用
    reserved: 0,   // 使用中
    maintenance: 0, // 维修中
    fault: 0       // 故障
  });

  const [recentDevices, setRecentDevices] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // 修正的状态统计函数
  const calculateStatusCounts = (devices) => {
    const counts = {
      available: 0,   // 对应"可用"
      reserved: 0,    // 对应"使用中"
      maintenance: 0, // 对应"维修中"
      fault: 0        // 对应"故障"
    };

    devices.forEach(device => {
      if (device.status === 'available') {
        counts.available++;
      } else if (device.status === 'reserved') {
        counts.reserved++;
      } else if (device.status === 'maintenance') {
        counts.maintenance++;
      } else if (device.status === 'fault') {
        counts.fault++;
      }
    });

    return counts;
  };

  // 从API获取仪表板数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 获取仪器列表
        const instrumentsResponse = await instrumentApi.getInstruments(pagination.page, pagination.pageSize);
        
        // 假设API返回的数据结构包含分页信息和数据列表
        const devices = instrumentsResponse.data || instrumentsResponse;
        setRecentDevices(devices);
        
        // 更新分页信息
        if (instrumentsResponse.total !== undefined) {
          setPagination(prev => ({
            ...prev,
            total: instrumentsResponse.total
          }));
        }

        // 计算状态统计
        const statusCounts = calculateStatusCounts(devices);
        setDeviceStatus(statusCounts);

        // 设置概览数据
        setOverview({
          deviceTotal: devices.length,
          labTechnicians: 24,
          currentProjects: 8
        });

        // 设置最近活动（可以从API获取，这里保持原有模拟数据）
        setRecentActivities([
          {
            id: '1',
            user: '李四',
            action: '提交了实验报告',
            timestamp: '今天 14:00',
            time: '14:00',
            type: 'report'
          },
          {
            id: '2',
            user: '张三',
            action: '预约了高效液相色谱仪:高效液相色谱仪',
            deviceName: '高效液相色谱仪',
            timestamp: '昨天 16:30',
            time: '16:30',
            type: 'reservation'
          },
          {
            id: '3',
            user: '系统',
            action: '新设备已到货:高效液相色谱仪',
            deviceName: '高效液相色谱仪',
            timestamp: '昨天 10:15',
            time: '10:15',
            type: 'device'
          },
          {
            id: '4',
            user: '王五',
            action: '完成离心机维护:离心机',
            deviceName: '离心机',
            timestamp: '前天 09:45',
            time: '09:45',
            type: 'maintenance'
          }
        ]);
      } catch (error) {
        console.error('获取仪表板数据失败:', error);
        // 即使API调用失败，也要确保页面能正常显示
        setRecentDevices([]);
        setDeviceStatus({ available: 0, reserved: 0, maintenance: 0, fault: 0 });
        setOverview({ deviceTotal: 0, labTechnicians: 24, currentProjects: 8 });
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [pagination.page, pagination.pageSize]);

  // 处理设备操作
  const handleInstrumentAction = async (instrumentId, action) => {
    const instrument = recentDevices.find(dev => dev.id === instrumentId);
    console.log(`处理仪器 ${instrument?.name} 的 ${action} 操作`);

    switch (action) {
      case 'reserve':
        // 预约设备逻辑
        alert(`预约仪器 ${instrument.name}`);
        // 这里可以添加API调用来更新服务器状态
        break;

      case 'cancelReservation':
        // 取消预约逻辑
        alert(`取消预约仪器 ${instrument.name}`);
        break;

      case 'view':
      case 'edit':
        // 查看/编辑详情逻辑
        setSelectedInstrument(instrument);
        setShowModal(true);
        break;

      case 'maintenance':
        // 维护设备逻辑
        alert(`开始维护仪器 ${instrument.name}`);
        break;

      default:
        console.log(`未定义的操作: ${action}`);
    }

    // 更新状态统计
    const updatedDevices = recentDevices.map(dev =>
      dev.id === instrumentId
        ? { ...dev, status: action === 'reserve' ? 'reserved' :
            action === 'cancelReservation' ? 'available' :
              action === 'maintenance' ? 'maintenance' : dev.status }
        : dev
    );

    setDeviceStatus(calculateStatusCounts(updatedDevices));
  };

  // 添加新仪器
  const handleAddNewInstrument = () => {
    setSelectedInstrument(null);
    setShowModal(true);
  };

  // 保存仪器
  const handleSaveInstrument = async (instrumentData) => {
    console.log('保存仪器数据:', instrumentData);

    try {
      let result;
      if (selectedInstrument) {
        // 更新现有仪器
        result = await instrumentApi.updateInstrument(selectedInstrument.id, instrumentData);
      } else {
        // 添加新仪器
        result = await instrumentApi.createInstrument(instrumentData);
      }

      // 重新获取数据以确保与服务器同步
      const instrumentsResponse = await instrumentApi.getInstruments(pagination.page, pagination.pageSize);
      const devices = instrumentsResponse.data || instrumentsResponse;
      setRecentDevices(devices);

      // 重新计算状态统计
      setDeviceStatus(calculateStatusCounts(devices));

      // 更新概览中的设备总数
      setOverview(prev => ({
        ...prev,
        deviceTotal: devices.length
      }));

      setShowModal(false);

      // 添加到最近活动
      const actionType = selectedInstrument ? '编辑了设备' : '添加了新设备';
      const newActivity = {
        id: Date.now().toString(),
        user: '管理员',
        action: `${actionType}: ${instrumentData.name}`,
        deviceName: instrumentData.name,
        timestamp: '刚刚',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'device'
      };

      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      
      // 刷新页面数据
      fetchDashboardData();
    } catch (error) {
      console.error('保存仪器失败:', error);
      alert(`保存失败: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
      {/* 欢迎标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">仪表板</h1>
        <p className="text-gray-600 mt-2">实验室管理系统概览 - 实时监控设备状态与活动</p>
      </div>

      {/* 概览卡片区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="实验室概览"
          items={[
            { label: '设备总数', value: overview.deviceTotal },
            { label: '实验员', value: overview.labTechnicians },
            { label: '当前项目', value: overview.currentProjects }
          ]}
        />

        <DashboardCard
          title="设备状态"
          items={[
            { label: '可用', value: deviceStatus.available }, // 使用正确的键名
            { label: '使用中', value: deviceStatus.reserved },
            { label: '维修中', value: deviceStatus.maintenance },
            { label: '故障', value: deviceStatus.fault }
          ]}
        />

        {/* 最近活动 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">最近活动</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              查看全部
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {activity.type === 'report' && '📄'}
                      {activity.type === 'reservation' && '📅'}
                      {activity.type === 'device' && '🔧'}
                      {activity.type === 'maintenance' && '🛠️'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>
                    <span> {activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <button
                  onClick={() => {
                    const device = recentDevices.find(d => d.name === activity.deviceName);
                    if (device) {
                      setSelectedInstrument(device);
                      setShowModal(true);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  查看
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 仪器列表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">仪器列表</h2>
            <p className="text-gray-600 text-sm mt-1">
              共 {recentDevices.length} 台设备，其中 {deviceStatus.available} 台可用
            </p>
          </div>
          <button
            onClick={handleAddNewInstrument}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            新建设备
          </button>
        </div>

        {/* 使用DashboardTable组件 */}
        <DashboardTable
          instruments={recentDevices}
          onInstrumentAction={handleInstrumentAction}
        />
      </div>

      {/* 使用DashboardModal */}
      {showModal && (
        <DashboardModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveInstrument}
          instrument={selectedInstrument}
        />
      )}
    </div>
  );
}