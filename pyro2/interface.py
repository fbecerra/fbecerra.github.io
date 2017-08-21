#!/usr/bin/env python

import sys
import os
import getopt
import time
import pickle
import numpy as np
import scipy as sc
import pylab as pl

from Tkinter import *
from tkFileDialog import askopenfilename
import ttk as ttk

import matplotlib
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

from util import profile
from util import runparams
from util import msg
import mesh.patch as patch

def isValidField(mydata, field):
	try: mydata.getVarPtr(field)
	except ValueError: return 0
	else: return 1

class App:

	def __init__(self):

		gui.wm_title("2D shocks visualization")

		self.menubar=Menu(gui)	
		self.filemenu = Menu(self.menubar, tearoff=0)
		self.filemenu.add_command(label="Run a new simulation", command=self.new_simulation)
		self.filemenu.add_command(label="Load snapshots", command=self.load_files)
		self.filemenu.add_separator()
		self.filemenu.add_command(label="Exit", command=gui.quit)
		self.menubar.add_cascade(label="File", menu=self.filemenu)
		gui.config(menu=self.menubar)
	
		#Plot frame
		self.frame_fig=Frame(gui)
		self.frame_fig.pack(side=RIGHT)
		
		self.fig=pl.figure(num=1, figsize=(8,6), dpi=100, facecolor='w')
		self.canvas=FigureCanvasTkAgg(self.fig, master=self.frame_fig)
		self.canvas._tkcanvas.config(background='white', borderwidth=0, highlightthickness=0)
		self.canvas.get_tk_widget().pack()
		
		
		#Frame buttons
		self.frame_options=Frame(gui)
		self.frame_options.pack(side=LEFT)
	

	def new_simulation(self):

		self.frame_options.destroy()
		self.frame_options=Frame(gui)	
		self.frame_options.pack(side=LEFT)
		self.label_problems = LabelFrame(self.frame_options, text="Choose a problem:", padx=5, pady=5)
		self.label_problems.pack(padx=10, pady=10)
		self.var_problem=StringVar()
		self.combobox_problem=ttk.Combobox(self.label_problems, textvar=self.var_problem, 
						   values=["-------Shocks:-------",  "compressible - sedov", "compressible - sod.x", "compressible - sod.y", "",
							"-------Other:-------", "compressible - bubble", "compressible - kh", "compressible - quad",
							"advection - smooth","advection - tophat", "diffusion - gaussian",
							"incompressible - converge.32", "incompressible - converge.64", "incompressible - converge.128", 
							"incompressible - shear"], state='readonly')
		self.combobox_problem.pack(side=TOP)
		self.combobox_problem.current(1)
		self.label_ics = LabelFrame(self.frame_options, text="Set Initial Conditions:", padx=5, pady=5)
		self.label_ics.pack(padx=10, pady=10)
		self.frame_buttons=Frame(self.frame_options)
		self.frame_buttons.pack()
		self.var_problem.trace('w', self.preset_ics)
		self.preset_ics()

	def preset_ics(self, *args): 
#	        self.problem_chosen=self.combobox_problem.get()
		self.solverName=self.var_problem.get().split(' - ',1)[0]
		self.problemName=self.var_problem.get().split(' - ',1)[1]
		if (self.problemName.find('.') != -1):
			self.problemNameInputs=self.problemName
			self.problemNameDefaults=self.problemName.split('.',1)[0]
		else:
			self.problemNameInputs=self.problemName
			self.problemNameDefaults=self.problemName
		self.paramFile="inputs."+self.problemNameInputs

		#-----------------------------------------------------------------------------
		# runtime parameters
		#-----------------------------------------------------------------------------
		
		# parameter defaults
		runparams.LoadParams("_defaults")
		runparams.LoadParams(self.solverName + "/_defaults")
		
		# problem-specific runtime parameters
		runparams.LoadParams(self.solverName + "/problems/_" + self.problemNameDefaults + ".defaults")
		
		# now read in the inputs file
		if (not os.path.isfile(self.paramFile)):
			# check if the param file lives in the solver's problems directory
			self.paramFile = self.solverName + "/problems/" + self.paramFile
			if (not os.path.isfile(self.paramFile)):
				msg.fail("ERROR: inputs file does not exist")
		
		runparams.LoadParams(self.paramFile, noNew=1)
		
		# write out the inputs.auto
#		runparams.PrintParamFile()

		###################################

		self.label_ics.destroy()
		self.frame_buttons.destroy()
		self.label_ics = LabelFrame(self.frame_options, text="Set Initial Conditions:", padx=5, pady=5)
		self.label_ics.pack(padx=10, pady=10)
		
		self.labels={}
		self.scales={}
		self.vars={}
		self.string_values={}
		self.keys=[]
		j=0

		for key in sorted(runparams.globalParams.keys()):
			if ((key.split('.',1)[0] == 'mesh'  and not ('boundary' in key.split('.',1)[1])) or key.split('.',1)[0] == self.problemNameDefaults  #self.solverName  
							and (runparams.isInt(runparams.getParam(key)) or runparams.isFloat(runparams.getParam(key)))):
				self.vars[key]=DoubleVar()
				self.labels[key]=Label(self.label_ics, text=key)
				self.labels[key].grid(row=j, column=0)
				self.scales[key]=Scale(self.label_ics, from_=0, to=8*runparams.getParam(key), orient=HORIZONTAL, showvalue=0, 
						       variable=self.vars[key], command=self.update_ics, resolution=-1)
				self.scales[key].grid(row=j, column=1)
				self.scales[key].set(runparams.getParam(key))
				self.string_values[key]=StringVar()
				self.string_values[key].set(str(self.vars[key].get()))
				self.labels[key]=Label(self.label_ics, textvariable=self.string_values[key])
				self.labels[key].grid(row=j, column=2)
				self.keys.append(key)
				j+=1
#		print self.keys
		self.save_outputs=IntVar()
		self.check_save_outputs = Checkbutton(self.label_ics, text="Save outputs", variable=self.save_outputs)
		self.check_save_outputs.grid(row=j, column=0, columnspan=2)
		self.save_images=IntVar()
		self.check_save_images = Checkbutton(self.label_ics, text="Save images", variable=self.save_images)
		self.check_save_images.grid(row=j+1, column=0, columnspan=2)
		if self.problemNameDefaults=="sedov" or self.problemNameDefaults=="sod":
			self.show_plots_run=IntVar()
			self.check_show_plots = Checkbutton(self.label_ics, text="Show plots", variable=self.show_plots_run, command=self.display_plots_run)
			self.check_show_plots.grid(row=j+2, column=0, columnspan=2)
		
		# Frame buttons
		self.frame_buttons=Frame(self.frame_options)
		self.frame_buttons.pack()
		
		self.button_run = Button(master=self.frame_buttons, text='Run!', command=self.run)
		self.button_run.pack(side=LEFT)
		
		self.button_quit = Button(master=self.frame_buttons, text='Quit', command=gui.quit)
		self.button_quit.pack(side=RIGHT)

	def update_ics(self, *args):
		for key in self.keys:
			self.string_values[key].set(str(self.vars[key].get()))
			runparams.setParam(key, self.vars[key].get())

	def load_files(self):

		self.loaded_files=askopenfilename(initialdir=os.getcwd()+"/outputs", multiple=True, filetypes=[("allfiles","*"), ("pyro outputs","*.pyro")])
		self.nfiles=len(self.loaded_files)

		self.frame_options.destroy()
		self.frame_options=Frame(gui)	
		self.frame_options.pack(side=LEFT)

		self.label_properties = LabelFrame(self.frame_options, text="Property to display:", padx=5, pady=5)
		self.label_properties.pack(padx=10, pady=10)

		self.fields=[]
		if isValidField(patch.read(self.loaded_files[0])[1],"density"):
			self.fields.append("Density")
		if isValidField(patch.read(self.loaded_files[0])[1],"x-momentum"):
                        self.fields.append("Velocity")
                if isValidField(patch.read(self.loaded_files[0])[1],"energy"):
			self.fields.append("Energy")
			self.fields.append("Pressure")
			
		self.combobox_properties=ttk.Combobox(self.label_properties, values=self.fields, state='readonly')
		self.combobox_properties.current(0)
		self.combobox_properties.pack(side=BOTTOM)

		self.frame_time=Frame(self.frame_options)
		self.frame_time.pack()

		self.label_time=Label(self.frame_time, text="Time:")
		self.label_time.pack(side=LEFT, fill=X)
		self.scale_times=Scale(self.frame_time, from_=1, to=self.nfiles, orient=HORIZONTAL, showvalue=0, command=self.draw_time)
                self.scale_times.pack(side=RIGHT, fill=X)

		if self.loaded_files[0].find("sedov")  != -1 or self.loaded_files[0].find("sod")  != -1:
			self.show_plots=IntVar()
			self.check_show_plots = Checkbutton(self.frame_options, text="Show plots", variable=self.show_plots, command=self.display_plots_load)
			self.check_show_plots.pack()

		self.frame_buttons=Frame(self.frame_options)
		self.frame_buttons.pack()

		self.button_play = Button(master=self.frame_buttons, text='Play', command=self.play_snapshots)
		self.button_play.pack(side=LEFT)

		self.button_pause = Button(master=self.frame_buttons, text='Pause', command=self.pause_snapshots)
		self.button_pause.pack(side=LEFT)

		self.button_quit = Button(master=self.frame_buttons, text='Quit', command=gui.quit)
		self.button_quit.pack(side=LEFT)

	def display_plots_load(self):
		if self.show_plots.get():
			self.gui_plots=Tk()
			self.gui_plots.wm_title("Plots")
			self.plot_variable(self.loaded_files[self.time_chosen-1], self.loaded_data, self.loaded_data.grid)
			self.fig.set_size_inches(4.0,8.0)
			self.canvas_plots=FigureCanvasTkAgg(self.fig, master=self.gui_plots)
			self.canvas_plots._tkcanvas.config(background='white', borderwidth=0, highlightthickness=0)
			self.canvas_plots.get_tk_widget().pack()
			self.button_quit = Button(self.gui_plots, text='Close', command=self.close_plots)
			self.button_quit.pack()
		else:
			self.gui_plots.destroy()

	def display_plots_run(self):
		if self.show_plots_run.get():
			self.gui_plots=Tk()
			self.gui_plots.wm_title("Plots")
			self.fig.set_size_inches(4.0,8.0)
			self.canvas_plots=FigureCanvasTkAgg(self.fig, master=self.gui_plots)
			self.canvas_plots._tkcanvas.config(background='white', borderwidth=0, highlightthickness=0)
			self.canvas_plots.get_tk_widget().pack()
			self.button_quit = Button(self.gui_plots, text='Close', command=self.close_plots)
			self.button_quit.pack()
		else:
			self.gui_plots.destroy()

	def plot_variable(self, file, myd, myg):
		pl.clf()
		dens = myd.getVarPtr("density")
		xmom = myd.getVarPtr("x-momentum")
		ymom = myd.getVarPtr("y-momentum")
		ener = myd.getVarPtr("energy")

		if file.find("sedov")  != -1:
			rho = dens[myg.ilo:myg.ihi+1,myg.jlo:myg.jhi+1]
			u = np.sqrt(xmom[myg.ilo:myg.ihi+1,myg.jlo:myg.jhi+1]**2 +
			               ymom[myg.ilo:myg.ihi+1,myg.jlo:myg.jhi+1]**2)/rho
			e = (ener[myg.ilo:myg.ihi+1,myg.jlo:myg.jhi+1] - 0.5*rho*u*u)/rho
			gamma = myd.getAux("gamma")
			p = rho*e*(gamma - 1.0)
			
			# radially bin
			# first define the bins
			rmin = 0
			rmax = np.sqrt(myg.xmax**2 + myg.ymax**2)
			nbins = np.int(np.sqrt(myg.nx**2 + myg.ny**2))
			
			# bins holds the edges, so there is one more value than actual bin
			# bin_centers holds the center value of the bin
			bins = np.linspace(rmin, rmax, nbins+1)
			bin_centers = 0.5*(bins[1:] + bins[:-1])
			
			# radius of each zone
			xcenter = 0.5*(myg.xmin + myg.xmax)
			ycenter = 0.5*(myg.ymin + myg.ymax)
			
			r = np.sqrt( (myg.x2d[myg.ilo:myg.ihi+1,myg.jlo:myg.jhi+1] - xcenter)**2 +
			                (myg.y2d[myg.ilo:myg.ihi+1,myg.jlo:myg.jhi+1] - ycenter)**2 )
			
			# bin the radii -- digitize returns an array with the same shape as
			# the input array but with elements of the array specifying which bin
			# that location belongs to.  The value of whichbin will be 1 if we are
			# located in the bin defined by bins[0] to bins[1].  This means that
			# there will be no 0s
			whichbin = np.digitize(r.flat, bins)
			
			# bincount counts the number of occurrences of each non-negative
			# integer value in whichbin.  Each entry in ncount gives the number
			# of occurrences of it in whichbin.  The length of ncount is
			# set by the maximum value in whichbin
			ncount = np.bincount(whichbin)
			
			# now bin the associated data
			rho_bin = np.zeros(len(ncount)-1, dtype=np.float64)
			u_bin   = np.zeros(len(ncount)-1, dtype=np.float64)
			p_bin   = np.zeros(len(ncount)-1, dtype=np.float64)
			
			n = 1
			while (n < len(ncount)):
			
			    # remember that there are no whichbin == 0, since that corresponds
			    # to the left edge.  So we want whichbin == 1 to correspond to the
			    # first value of bin_centers (bin_centers[0])
			    rho_bin[n-1] = np.sum(rho.flat[whichbin==n])/np.sum(ncount[n])
			    u_bin[n-1]   = np.sum(  u.flat[whichbin==n])/np.sum(ncount[n])
			    p_bin[n-1]   = np.sum(  p.flat[whichbin==n])/np.sum(ncount[n])
			    n += 1
			
			bin_centers = bin_centers[0:len(ncount)-1]
			
			# plot
			self.fig, axes = pl.subplots(nrows=3, ncols=1, num=1)
			pl.rc("font", size=10)
			
			ax = axes.flat[0]
			ax.scatter(bin_centers, rho_bin, s=7, color="r")
			ax.plot(bin_centers, rho_bin)
			ax.set_ylabel(r"$\rho$")
			ax.set_xlim(0,0.6)
			
			ax = axes.flat[1]
			ax.scatter(bin_centers, u_bin, s=7, color="r")
			ax.plot(bin_centers, u_bin)
			ax.set_ylabel(r"$u$")
			ax.set_xlim(0,0.6)
			
			ax = axes.flat[2]
			ax.scatter(bin_centers, p_bin, s=7, color="r")
			ax.plot(bin_centers, p_bin)
			ax.set_ylabel(r"$p$")
			ax.set_xlim(0,0.6)
			ax.set_xlabel(r"r")
			
			pl.subplots_adjust(hspace=0.25)
#			pl.tight_layout()
			self.fig.set_size_inches(4.0,8.0)
			try:
				self.save_images.get()
			except AttributeError:
				pass
			else:
				if self.save_images.get():
					self.basename = self.solverName+"_"+self.problemNameInputs+"_"
					try: 
						os.system('mkdir -p plots/'+self.problemNameInputs)
					except IOError:
						pass # does nothing
					pl.savefig('./plots/'+self.problemNameInputs+'/'+self.basename + "%4.4d" % (self.n) + ".png", bbox_inches="tight")

		elif file.find("sod")  != -1:
			# get the 1-d profile from the simulation data -- assume that whichever
			# coordinate is the longer one is the direction of the problem
			if (myg.nx > myg.ny):
			    # x-problem
			    x = myg.x[myg.ilo:myg.ihi+1]
			    jj = myg.ny/2
			
			    rho = dens[myg.ilo:myg.ihi+1,jj]
			    u = xmom[myg.ilo:myg.ihi+1,jj]/rho
			    ut = ymom[myg.ilo:myg.ihi+1,jj]/rho
			    e = (ener[myg.ilo:myg.ihi+1,jj] - 0.5*rho*(u*u + ut*ut))/rho
			    gamma = myd.getAux("gamma")
			    p = rho*e*(gamma - 1.0)
			else:
			    # y-problem
			    x = myg.y[myg.jlo:myg.jhi+1]
			    ii = myg.nx/2
			
			    rho = dens[ii,myg.jlo:myg.jhi+1]
			    u = ymom[ii,myg.jlo:myg.jhi+1]/rho
			    ut = xmom[ii,myg.jlo:myg.jhi+1]/rho
			    e = (ener[ii,myg.jlo:myg.jhi+1] - 0.5*rho*(u*u + ut*ut))/rho
			    gamma = myd.getAux("gamma")
			    p = rho*e*(gamma - 1.0)
			
			# plot
			self.fig, axes = pl.subplots(nrows=4, ncols=1, num=1)
			pl.rc("font", size=10)
			
			ax = axes.flat[0]
			ax.scatter(x, rho, s=7, color="r")
			ax.plot(x, rho)
			ax.set_ylabel(r"$\rho$")
			ax.set_xlim(0,1.0)
			ax.set_ylim(0,1.1)
			
			ax = axes.flat[1]
			ax.scatter(x, u, s=7, color="r")
			ax.plot(x, u)
			ax.set_ylabel(r"$u$")
			ax.set_xlim(0,1.0)
			
			ax = axes.flat[2]
			ax.scatter(x, p, s=7, color="r")
			ax.plot(x, p)
			ax.set_ylabel(r"$p$")
			ax.set_xlim(0,1.0)
			
			ax = axes.flat[3]
			ax.scatter(x, e, s=7, color="r")
			ax.plot(x, e)
			if (myg.nx > myg.ny):
			    ax.set_xlabel(r"x")
			else:
			    ax.set_xlabel(r"y")
			ax.set_ylabel(r"$e$")
			ax.set_xlim(0,1.0)
			
			pl.subplots_adjust(hspace=0.25)
#			pl.tight_layout()
			self.fig.set_size_inches(4.0,8.0)
			try:
				self.save_images.get()
			except AttributeError:
				pass
			else:
				if self.save_images.get():
					self.basename = self.solverName+"_"+self.problemNameInputs+"_"
					try: 
						os.system('mkdir -p plots/'+self.problemNameInputs)
					except IOError:
						pass # does nothing
					pl.savefig('./plots/'+self.problemNameInputs+'/'+self.basename + "%4.4d" % (self.n) + ".png", bbox_inches="tight")

	def close_plots(self):
		self.gui_plots.destroy()
		self.show_plots.set(0)

	def play_snapshots(self):
		self.play=True
		for index_file in range(int(self.time_chosen),self.nfiles):
			if not self.play:
				break
			pF = open(self.loaded_files[index_file], "rb")
			self.loaded_data = pickle.load(pF)
			pF.close()
			self.scale_times.set(index_file+1)
			self.draw()

	def pause_snapshots(self):
		self.play=False

	def draw_time(self, val):
		self.time_chosen=int(val)
		pF = open(self.loaded_files[self.time_chosen-1], "rb")
		self.loaded_data = pickle.load(pF)
		pF.close()
		self.draw()
		if  (self.loaded_files[self.time_chosen-1].find("sedov")  != -1 or self.loaded_files[self.time_chosen-1].find("sod")  != -1) and self.show_plots.get():
			self.plot_variable(self.loaded_files[self.time_chosen-1], self.loaded_data, self.loaded_data.grid)
			self.canvas_plots.draw()

	def draw(self):
		self.property_selected=self.combobox_properties.get()
		dens=self.loaded_data.getVarPtr("density")
		if self.property_selected == "Density":
			prop=dens
		else:
			xmom = self.loaded_data.getVarPtr("x-momentum")
			ymom = self.loaded_data.getVarPtr("y-momentum")
	
			# get the velocities
			u = xmom/dens
			v = ymom/dens
			magvel = u**2 + v**2
			if self.property_selected == "Velocity":
				prop=np.sqrt(magvel)
			else:
				ener = self.loaded_data.getVarPtr("energy")
				rhoe = (ener - 0.5*dens*magvel)
				if self.property_selected == "Energy":
					prop=rhoe/dens
				else:
					gamma = self.loaded_data.getAux("gamma")
					p = rhoe*(gamma - 1.0)
					prop = p
		pl.clf()
                pl.imshow(np.transpose(prop[self.loaded_data.grid.ilo:self.loaded_data.grid.ihi+1,self.loaded_data.grid.jlo:self.loaded_data.grid.jhi+1]),
                        interpolation="nearest", origin="lower",
                        extent=[self.loaded_data.grid.xmin, self.loaded_data.grid.xmax, self.loaded_data.grid.ymin, self.loaded_data.grid.ymax])
                pl.xlabel("x")
                pl.ylabel("y")
                pl.title(self.property_selected)
                pl.colorbar()
                pl.figtext(0.05,0.0125, "t = %10.5f" % self.loaded_data.t)
		self.fig.set_size_inches(8,6)
                self.canvas.draw()
			

	def run(self):

		msg.bold('pyro ...')
		self.pf = profile.timer("main")
		self.pf.begin()
		
		# actually import the solver-specific stuff under the 'solver' namespace
		exec 'import ' + self.solverName + ' as solver'
		
		self.initialize(solver)
		self.evolve(solver)	
		

	def initialize(self, solver):

		#-----------------------------------------------------------------------------
		# initialization
		#-----------------------------------------------------------------------------
		
		# initialize the grid structure
		self.myGrid, self.myData = solver.initialize()
#		self.myData.grid.xmin=1
#		self.myData.grid.xmax=2
#		self.myData.grid.ymin=1
#		self.myData.grid.ymax=2
		
		# initialize the data
		exec 'from ' + self.solverName + '.problems import *'
		
		exec self.problemNameDefaults + '.initData(self.myData)'
				
		#-----------------------------------------------------------------------------
		# pre-evolve
		#-----------------------------------------------------------------------------
		solver.preevolve(self.myData)
		
		
		#-----------------------------------------------------------------------------
		# evolve
		#-----------------------------------------------------------------------------
		self.tmax = runparams.getParam("driver.tmax")
		self.max_steps = runparams.getParam("driver.max_steps")
		
		self.init_tstep_factor = runparams.getParam("driver.init_tstep_factor")
		self.max_dt_change = runparams.getParam("driver.max_dt_change")
		self.fix_dt = runparams.getParam("driver.fix_dt")
		
		pl.ion()
		
		self.n = 0
		self.myData.t = 0.0
	
		# output the 0th data
		if (self.save_outputs.get()):	
			self.basename = self.solverName+"_"+self.problemNameInputs+"_"
			try: 
				os.system('mkdir -p outputs/'+self.problemNameInputs)
			except IOError:
				pass # does nothing
			self.myData.write("./outputs/"+self.problemNameInputs+"/"+self.basename + "%4.4d" % (self.n))
		
		self.dovis = runparams.getParam("vis.dovis")
		if (self.dovis):
			solver.dovis(self.myData, 0)
			self.fig.set_size_inches(8,6)
			self.canvas.draw()
			if (self.save_images.get()):
				self.basename = self.solverName+"_"+self.problemNameInputs+"_"
				try: 
					os.system('mkdir -p images/'+self.problemNameInputs)
				except IOError:
					pass # does nothing
				pl.savefig('./images/'+self.problemNameInputs+'/'+self.basename + "%4.4d" % (self.n) + ".png")
		if self.show_plots_run.get():
			self.plot_variable(self.problemNameInputs, self.myData, self.myData.grid)
			self.canvas_plots.draw()
	

	def evolve(self, solver):		

		self.nout = 0
		
		while (self.myData.t < self.tmax and self.n < self.max_steps):
		
			# fill boundary conditions
			self.pfb = profile.timer("fillBC")
			self.pfb.begin()
			self.myData.fillBCAll()
			self.pfb.end()
			
			# get the timestep
			self.dt = solver.timestep(self.myData)
			if (self.fix_dt > 0.0):
				self.dt = self.fix_dt
			else:
				if (self.n == 0):
					self.dt = self.init_tstep_factor*self.dt
					self.dtOld = self.dt
				else:
					self.dt = min(self.max_dt_change*self.dtOld, self.dt)
					self.dtOld = self.dt
			
			if (self.myData.t + self.dt > self.tmax):
				self.dt = self.tmax - self.myData.t
			
			# evolve for a single timestep
			solver.evolve(self.myData, self.dt)
			
			
			# increment the time
			self.myData.t += self.dt
			self.n += 1
			print "%5d %10.5f %10.5f" % (self.n, self.myData.t, self.dt)
			
			
			# output
			self.dt_out = runparams.getParam("io.dt_out")
			self.n_out = runparams.getParam("io.n_out")

			if (self.save_outputs.get()):
			
				self.pfc = profile.timer("output")
				self.pfc.begin()
				if (self.nout == 0):
					msg.warning("outputting...")
				self.basename = self.solverName+"_"+self.problemNameInputs+"_"
				self.myData.write("./outputs/"+self.problemNameInputs+"/"+self.basename + "%4.4d" % (self.n))
				self.nout += 1
				
				self.pfc.end()
			
			# visualization
			if (self.dovis):
				self.pfd = profile.timer("vis")
				self.pfd.begin()
				solver.dovis(self.myData, self.n)
				self.fig.set_size_inches(8,6)
				self.canvas.draw()
				#self.store = runparams.getParam("vis.store_images")
				
				if (self.save_images.get()):
					self.basename = self.solverName+"_"+self.problemNameInputs+"_"
					try: 
						os.system('mkdir -p images/'+self.problemNameInputs)
					except IOError:
						pass # does nothing
					pl.savefig('./images/'+self.problemNameInputs+'/'+self.basename + "%4.4d" % (self.n) + ".png")
				
				self.pfd.end()

			if self.show_plots_run.get():
				self.plot_variable(self.problemNameInputs, self.myData, self.myData.grid)
				self.canvas_plots.draw()
		
		self.pf.end()
		profile.timeReport()

gui=Tk()
app=App()
gui.mainloop()
